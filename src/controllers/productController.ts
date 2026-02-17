import { Response } from 'express';
import { AuthRequest, UserRole } from '../types';
import prisma from '../config/database';
import { sendError, sendSuccess } from '../utils/response';

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productData = req.body;

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
        supplier: true
      }
    });

    sendSuccess(res, 201, 'Product created successfully', { product });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error creating product');
  }
};

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, categoryId, supplierId, lowStock, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { sku: { contains: search as string } },
        { barcode: { contains: search as string } }
      ];
    }

    if (categoryId) where.categoryId = categoryId as string;
    if (supplierId) where.supplierId = supplierId as string;

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

    // Filter low stock if requested
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(product => {
        const totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        return totalStock < product.minStock;
      });
    }

    const total = await prisma.product.count({ where });

    sendSuccess(res, 200, 'Products retrieved successfully', {
      products: filteredProducts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching products');
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

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
      sendError(res, 404, 'Product not found');
      return;
    }

    // Calculate total stock
    const totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);

    sendSuccess(res, 200, 'Product retrieved successfully', {
      product: {
        ...product,
        totalStock,
        isLowStock: totalStock < product.minStock
      }
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching product');
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
        supplier: true
      }
    });

    sendSuccess(res, 200, 'Product updated successfully', { product });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error updating product');
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    await prisma.product.delete({
      where: { id: productId }
    });

    sendSuccess(res, 200, 'Product deleted successfully', null);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error deleting product');
  }
};

export const getLowStockProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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

    const lowStockProducts = products.filter(product => {
      const totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
      return totalStock < product.minStock;
    }).map(product => ({
      ...product,
      totalStock: product.inventories.reduce((sum, inv) => sum + inv.quantity, 0)
    }));

    sendSuccess(res, 200, 'Low stock products retrieved successfully', {
      products: lowStockProducts,
      count: lowStockProducts.length
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching low stock products');
  }
};
