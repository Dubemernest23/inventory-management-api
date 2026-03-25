import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/response';

interface GetAllProductsParams {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  lowStock?: string;
  page?: number | string;
  limit?: number | string;
}

export const createProductService = async (productData: Prisma.ProductUncheckedCreateInput) => {
  return prisma.product.create({
    data: productData,
    include: {
      category: true,
      supplier: true
    }
  });
};

export const getAllProductsService = async (params: GetAllProductsParams) => {
  const { search, categoryId, supplierId, lowStock, page = 1, limit = 10 } = params;

  const skip = (Number(page) - 1) * Number(limit);
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { barcode: { contains: search } }
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (supplierId) {
    where.supplierId = supplierId;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      supplier: true,
      inventories: {
        include: {
          warehouse: true
        }
      }
    },
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  let filteredProducts = products;
  if (lowStock === 'true') {
    filteredProducts = products.filter((product) => {
      const totalStock = product.inventories.reduce((sum, inventory) => sum + inventory.quantity, 0);
      return totalStock < product.minStock;
    });
  }

  const total = await prisma.product.count({ where });

  return {
    products: filteredProducts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

export const getProductByIdService = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      supplier: true,
      inventories: {
        include: {
          warehouse: true
        }
      },
      stockMovements: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const totalStock = product.inventories.reduce((sum, inventory) => sum + inventory.quantity, 0);

  return {
    ...product,
    totalStock,
    isLowStock: totalStock < product.minStock
  };
};

export const updateProductService = async (
  productId: string,
  updateData: Prisma.ProductUncheckedUpdateInput
) => {
  return prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      category: true,
      supplier: true
    }
  });
};

export const deleteProductService = async (productId: string) => {
  await prisma.product.delete({
    where: { id: productId }
  });
};

export const getLowStockProductsService = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      supplier: true,
      inventories: {
        include: {
          warehouse: true
        }
      }
    }
  });

  const lowStockProducts = products
    .filter((product) => {
      const totalStock = product.inventories.reduce((sum, inventory) => sum + inventory.quantity, 0);
      return totalStock < product.minStock;
    })
    .map((product) => ({
      ...product,
      totalStock: product.inventories.reduce((sum, inventory) => sum + inventory.quantity, 0)
    }));

  return {
    products: lowStockProducts,
    count: lowStockProducts.length
  };
};
