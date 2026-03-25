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

export const createProductService = async (
  businessId: string,
  productData: Prisma.ProductUncheckedCreateInput
) => {
  return prisma.product.create({
    data: {
      ...productData,
      businessId
    },
    include: {
      category: true,
      supplier: true,
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
};

export const getAllProductsService = async (businessId: string, params: GetAllProductsParams) => {
  const { search, categoryId, supplierId, lowStock, page = 1, limit = 10 } = params;

  const skip = (Number(page) - 1) * Number(limit);
  const where: Prisma.ProductWhereInput = { businessId };

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
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      },
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

export const getProductByIdService = async (businessId: string, productId: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      businessId
    },
    include: {
      category: true,
      supplier: true,
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      },
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
  businessId: string,
  productId: string,
  updateData: Prisma.ProductUncheckedUpdateInput
) => {
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      businessId
    },
    select: { id: true }
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  return prisma.product.update({
    where: { id: existingProduct.id },
    data: updateData,
    include: {
      category: true,
      supplier: true,
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
};

export const deleteProductService = async (businessId: string, productId: string) => {
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      businessId
    },
    select: { id: true }
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({
    where: { id: existingProduct.id }
  });
};

export const getLowStockProductsService = async (businessId: string) => {
  const products = await prisma.product.findMany({
    where: { businessId },
    include: {
      category: true,
      supplier: true,
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      },
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

const assertProductInBusiness = async (businessId: string, productId: string) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, businessId },
    select: { id: true, businessId: true }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

export const createProductVariantService = async (
  businessId: string,
  productId: string,
  variantData: Prisma.ProductVariantUncheckedCreateInput
) => {
  await assertProductInBusiness(businessId, productId);

  return prisma.productVariant.create({
    data: {
      ...variantData,
      productId,
      businessId
    }
  });
};

export const getProductVariantsService = async (businessId: string, productId: string) => {
  await assertProductInBusiness(businessId, productId);

  return prisma.productVariant.findMany({
    where: {
      businessId,
      productId
    },
    orderBy: { createdAt: 'asc' }
  });
};

export const updateProductVariantService = async (
  businessId: string,
  productId: string,
  variantId: string,
  updateData: Prisma.ProductVariantUncheckedUpdateInput
) => {
  await assertProductInBusiness(businessId, productId);

  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      businessId,
      productId
    },
    select: { id: true }
  });

  if (!variant) {
    throw new AppError('Variant not found', 404);
  }

  return prisma.productVariant.update({
    where: { id: variant.id },
    data: updateData
  });
};

export const deleteProductVariantService = async (
  businessId: string,
  productId: string,
  variantId: string
) => {
  await assertProductInBusiness(businessId, productId);

  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      businessId,
      productId
    },
    select: { id: true }
  });

  if (!variant) {
    throw new AppError('Variant not found', 404);
  }

  await prisma.productVariant.delete({
    where: { id: variant.id }
  });
};

export const createProductImageService = async (
  businessId: string,
  productId: string,
  imageData: Prisma.ProductImageUncheckedCreateInput
) => {
  await assertProductInBusiness(businessId, productId);

  if (imageData.isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false }
    });
  }

  return prisma.productImage.create({
    data: {
      ...imageData,
      productId
    }
  });
};

export const getProductImagesService = async (businessId: string, productId: string) => {
  await assertProductInBusiness(businessId, productId);

  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' }
  });
};

export const updateProductImageService = async (
  businessId: string,
  productId: string,
  imageId: string,
  updateData: Prisma.ProductImageUncheckedUpdateInput
) => {
  await assertProductInBusiness(businessId, productId);

  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId
    },
    select: { id: true }
  });

  if (!image) {
    throw new AppError('Image not found', 404);
  }

  if (updateData.isPrimary === true) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false }
    });
  }

  return prisma.productImage.update({
    where: { id: image.id },
    data: updateData
  });
};

export const deleteProductImageService = async (
  businessId: string,
  productId: string,
  imageId: string
) => {
  await assertProductInBusiness(businessId, productId);

  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId
    },
    select: { id: true }
  });

  if (!image) {
    throw new AppError('Image not found', 404);
  }

  await prisma.productImage.delete({
    where: { id: image.id }
  });
};
