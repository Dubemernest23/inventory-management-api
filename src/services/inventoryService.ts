import { Prisma, StockMovementType } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/response';

interface CreateStockMovementInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  type: StockMovementType;
  notes?: string;
}

interface GetAllStockMovementsParams {
  productId?: string;
  warehouseId?: string;
  type?: string;
  page?: number | string;
  limit?: number | string;
}

export const createWarehouseService = async (warehouseData: Prisma.WarehouseUncheckedCreateInput) => {
  return prisma.warehouse.create({ data: warehouseData });
};

export const getAllWarehousesService = async () => {
  return prisma.warehouse.findMany({
    include: {
      inventories: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getWarehouseByIdService = async (warehouseId: string) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
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
  warehouseId: string,
  updateData: Prisma.WarehouseUncheckedUpdateInput
) => {
  return prisma.warehouse.update({
    where: { id: warehouseId },
    data: updateData
  });
};

export const deleteWarehouseService = async (warehouseId: string) => {
  await prisma.warehouse.delete({ where: { id: warehouseId } });
};

export const createCategoryService = async (categoryData: Prisma.CategoryUncheckedCreateInput) => {
  return prisma.category.create({ data: categoryData });
};

export const getAllCategoriesService = async () => {
  return prisma.category.findMany({
    include: {
      products: {
        select: { id: true, name: true, sku: true }
      }
    },
    orderBy: { name: 'asc' }
  });
};

export const updateCategoryService = async (
  categoryId: string,
  updateData: Prisma.CategoryUncheckedUpdateInput
) => {
  return prisma.category.update({
    where: { id: categoryId },
    data: updateData
  });
};

export const deleteCategoryService = async (categoryId: string) => {
  await prisma.category.delete({ where: { id: categoryId } });
};

export const createStockMovementService = async (
  movementData: CreateStockMovementInput,
  userId: string
) => {
  const { productId, warehouseId, quantity, type, notes } = movementData;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  let inventory = await prisma.inventory.findUnique({
    where: {
      productId_warehouseId: { productId, warehouseId }
    }
  });

  if (!inventory) {
    inventory = await prisma.inventory.create({
      data: { productId, warehouseId, quantity: 0 }
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

  const [stockMovement, updatedInventory] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId,
        warehouseId,
        quantity,
        type,
        notes,
        userId
      },
      include: {
        product: true,
        user: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: newQuantity }
    })
  ]);

  return { stockMovement, inventory: updatedInventory };
};

export const getAllStockMovementsService = async (params: GetAllStockMovementsParams) => {
  const { productId, warehouseId, type, page = 1, limit = 20 } = params;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.StockMovementWhereInput = {};
  if (productId) {
    where.productId = productId;
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

export const getInventoryByWarehouseService = async (warehouseId: string) => {
  const inventory = await prisma.inventory.findMany({
    where: { warehouseId },
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

  return {
    inventory,
    count: inventory.length
  };
};

export const getStockReportService = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      supplier: true,
      inventories: {
        include: { warehouse: true }
      }
    }
  });

  const report = products.map((product) => {
    const totalStock = product.inventories.reduce((sum, inventory) => sum + inventory.quantity, 0);
    const stockValue = totalStock * Number(product.price);

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name,
      supplier: product.supplier?.name,
      totalStock,
      minStock: product.minStock,
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
