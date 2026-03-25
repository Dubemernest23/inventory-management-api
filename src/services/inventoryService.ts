import { CostingMethod, Prisma, StockMovementType } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/response';

interface CreateStockMovementInput {
  productId: string;
  variantId?: string;
  warehouseId: string;
  quantity: number;
  type: StockMovementType;
  reason?: string;
  unitCost?: number;
  notes?: string;
}

interface GetAllStockMovementsParams {
  productId?: string;
  variantId?: string;
  warehouseId?: string;
  type?: string;
  page?: number | string;
  limit?: number | string;
}

export const createWarehouseService = async (
  businessId: string,
  warehouseData: Prisma.WarehouseUncheckedCreateInput
) => {
  return prisma.warehouse.create({
    data: {
      ...warehouseData,
      businessId
    }
  });
};

export const getAllWarehousesService = async (businessId: string) => {
  return prisma.warehouse.findMany({
    where: { businessId },
    include: {
      inventories: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getWarehouseByIdService = async (businessId: string, warehouseId: string) => {
  const warehouse = await prisma.warehouse.findFirst({
    where: {
      id: warehouseId,
      businessId
    },
    include: {
      inventories: {
        include: { product: { include: { category: true, supplier: true } } }
      }
    }
  });

  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  return warehouse;
};

export const updateWarehouseService = async (
  businessId: string,
  warehouseId: string,
  updateData: Prisma.WarehouseUncheckedUpdateInput
) => {
  const existingWarehouse = await prisma.warehouse.findFirst({
    where: {
      id: warehouseId,
      businessId
    },
    select: { id: true }
  });

  if (!existingWarehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  return prisma.warehouse.update({
    where: { id: existingWarehouse.id },
    data: updateData
  });
};

export const deleteWarehouseService = async (businessId: string, warehouseId: string) => {
  const existingWarehouse = await prisma.warehouse.findFirst({
    where: {
      id: warehouseId,
      businessId
    },
    select: { id: true }
  });

  if (!existingWarehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  await prisma.warehouse.delete({ where: { id: existingWarehouse.id } });
};

export const createCategoryService = async (
  businessId: string,
  categoryData: Prisma.CategoryUncheckedCreateInput
) => {
  return prisma.category.create({
    data: {
      ...categoryData,
      businessId
    }
  });
};

export const getAllCategoriesService = async (businessId: string) => {
  return prisma.category.findMany({
    where: { businessId },
    include: {
      products: {
        select: { id: true, name: true, sku: true }
      }
    },
    orderBy: { name: 'asc' }
  });
};

export const updateCategoryService = async (
  businessId: string,
  categoryId: string,
  updateData: Prisma.CategoryUncheckedUpdateInput
) => {
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      businessId
    },
    select: { id: true }
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  return prisma.category.update({
    where: { id: existingCategory.id },
    data: updateData
  });
};

export const deleteCategoryService = async (businessId: string, categoryId: string) => {
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      businessId
    },
    select: { id: true }
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  await prisma.category.delete({ where: { id: existingCategory.id } });
};

export const createStockMovementService = async (
  businessId: string,
  movementData: CreateStockMovementInput,
  userId: string
) => {
  const { productId, variantId, warehouseId, quantity, type, reason, unitCost, notes } = movementData;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, costingMethod: true }
  });
  if (!business) {
    throw new AppError('Business not found', 404);
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, businessId },
    select: { id: true, costPrice: true }
  });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const warehouse = await prisma.warehouse.findFirst({
    where: { id: warehouseId, businessId },
    select: { id: true }
  });
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  let variant: { id: string; costPrice: Prisma.Decimal | null; stockQty: number } | null = null;
  if (variantId) {
    variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
        businessId
      },
      select: {
        id: true,
        costPrice: true,
        stockQty: true
      }
    });

    if (!variant) {
      throw new AppError('Variant not found for product', 404);
    }
  }

  let inventory = await prisma.inventory.findUnique({
    where: {
      businessId_productId_warehouseId: { businessId, productId, warehouseId }
    }
  });

  if (!inventory) {
    inventory = await prisma.inventory.create({
      data: { businessId, productId, warehouseId, quantity: 0 }
    });
  }

  let newQuantity = inventory.quantity;
  if (type === StockMovementType.IN || type === StockMovementType.ADJUSTMENT) {
    newQuantity += quantity;
  } else if (type === StockMovementType.OUT) {
    newQuantity -= quantity;
    if (newQuantity < 0) {
      throw new AppError('Insufficient stock', 400);
    }
  }

  if (variant && type === StockMovementType.OUT && variant.stockQty < quantity) {
    throw new AppError('Insufficient variant stock', 400);
  }

  return prisma.$transaction(async (tx) => {
    let resolvedUnitCost: number | null = unitCost ?? null;
    let cogsValue: number | null = null;

    if (type === StockMovementType.IN || type === StockMovementType.ADJUSTMENT) {
      const fallbackUnitCost = Number(variant?.costPrice ?? product.costPrice ?? 0);
      resolvedUnitCost = unitCost ?? fallbackUnitCost;

      if (!resolvedUnitCost || resolvedUnitCost <= 0) {
        throw new AppError(
          'unitCost is required for inbound stock when no product/variant cost price is set',
          400
        );
      }

      const createdLayer = await tx.inventoryLayer.create({
        data: {
          businessId,
          productId,
          variantId: variant?.id ?? null,
          warehouseId,
          quantity,
          qtyRemaining: quantity,
          costPrice: resolvedUnitCost,
          sourceType: 'STOCK_MOVEMENT'
        }
      });

      await tx.inventoryLayer.update({
        where: { id: createdLayer.id },
        data: { sourceId: createdLayer.id }
      });
    }

    if (type === StockMovementType.OUT) {
      const ordering = business.costingMethod === CostingMethod.FIFO ? 'asc' : 'desc';
      let remainingToConsume = quantity;
      let cogsAccumulator = 0;

      const layers = await tx.inventoryLayer.findMany({
        where: {
          businessId,
          productId,
          variantId: variant?.id ?? null,
          warehouseId,
          qtyRemaining: { gt: 0 }
        },
        orderBy: [{ receivedAt: ordering }, { createdAt: ordering }]
      });

      for (const layer of layers) {
        if (remainingToConsume <= 0) {
          break;
        }

        const consumedQty = Math.min(remainingToConsume, layer.qtyRemaining);
        const newLayerBalance = layer.qtyRemaining - consumedQty;
        cogsAccumulator += consumedQty * Number(layer.costPrice);
        remainingToConsume -= consumedQty;

        await tx.inventoryLayer.update({
          where: { id: layer.id },
          data: { qtyRemaining: newLayerBalance }
        });
      }

      if (remainingToConsume > 0) {
        throw new AppError('Insufficient inventory cost layers for stock-out', 400);
      }

      cogsValue = cogsAccumulator;
    }

    const stockMovement = await tx.stockMovement.create({
      data: {
        businessId,
        productId,
        variantId: variant?.id ?? null,
        warehouseId,
        quantity,
        type,
        reason,
        unitCost: resolvedUnitCost,
        cogs: cogsValue,
        notes,
        userId
      },
      include: {
        product: true,
        variant: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const updatedInventory = await tx.inventory.update({
      where: { id: inventory.id },
      data: { quantity: newQuantity }
    });

    if (variant) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          stockQty: type === StockMovementType.OUT ? { decrement: quantity } : { increment: quantity }
        }
      });
    }

    return { stockMovement, inventory: updatedInventory };
  });
};

export const getAllStockMovementsService = async (
  businessId: string,
  params: GetAllStockMovementsParams
) => {
  const { productId, variantId, warehouseId, type, page = 1, limit = 20 } = params;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.StockMovementWhereInput = { businessId };
  if (productId) {
    where.productId = productId;
  }
  if (variantId) {
    where.variantId = variantId;
  }
  if (warehouseId) {
    where.warehouseId = warehouseId;
  }
  if (type) {
    where.type = type as StockMovementType;
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.stockMovement.count({ where })
  ]);

  return {
    movements,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

export const getInventoryByWarehouseService = async (businessId: string, warehouseId: string) => {
  const inventory = await prisma.inventory.findMany({
    where: { businessId, warehouseId },
    include: {
      product: {
        include: {
          category: true,
          supplier: true
        }
      },
      warehouse: true
    }
  });

  const variants = await prisma.productVariant.findMany({
    where: {
      businessId,
      stockQty: { gt: 0 }
    },
    select: {
      id: true,
      productId: true,
      name: true,
      sku: true,
      stockQty: true
    },
    orderBy: { createdAt: 'asc' }
  });

  return {
    inventory,
    variants,
    count: inventory.length
  };
};

export const getStockReportService = async (businessId: string) => {
  const [products, layerSummary] = await Promise.all([
    prisma.product.findMany({
      where: { businessId },
      include: {
        category: true,
        supplier: true,
        variants: true,
        inventories: {
          include: { warehouse: true }
        }
      }
    }),
    prisma.inventoryLayer.groupBy({
      by: ['productId'],
      where: {
        businessId,
        qtyRemaining: { gt: 0 }
      },
      _sum: {
        qtyRemaining: true
      }
    })
  ]);

  const layerTotalsByProduct = new Map<string, number>();
  for (const row of layerSummary) {
    layerTotalsByProduct.set(row.productId, row._sum.qtyRemaining ?? 0);
  }

  const report = products.map((product) => {
    const totalStock = product.inventories.reduce((sum, inventory) => sum + inventory.quantity, 0);
    const stockValue = totalStock * Number(product.price);
    const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stockQty, 0);

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name,
      supplier: product.supplier?.name,
      totalStock,
      totalVariantStock,
      layeredQtyRemaining: layerTotalsByProduct.get(product.id) ?? 0,
      minStock: product.minStock,
      reorderPoint: product.reorderPoint,
      isLowStock: totalStock < product.minStock,
      price: product.price,
      stockValue,
      warehouseBreakdown: product.inventories.map((inventory) => ({
        warehouse: inventory.warehouse.name,
        quantity: inventory.quantity
      }))
    };
  });

  const totalValue = report.reduce((sum, item) => sum + item.stockValue, 0);
  const lowStockCount = report.filter((item) => item.isLowStock).length;

  return {
    report,
    summary: {
      totalProducts: products.length,
      totalStockValue: totalValue,
      lowStockProducts: lowStockCount
    }
  };
};
