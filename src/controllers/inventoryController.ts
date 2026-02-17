import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { sendError, sendSuccess } from '../utils/response';

// ==================== WAREHOUSE CONTROLLER ====================
export const createWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouseData = req.body;
    const warehouse = await prisma.warehouse.create({ data: warehouseData });
    sendSuccess(res, 201, 'Warehouse created successfully', { warehouse });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error creating warehouse');
  }
};

export const getAllWarehouses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        inventories: {
          include: { product: true }
          }
      },
      orderBy: { createdAt: 'desc' }
    });
    sendSuccess(res, 200, 'Warehouses retrieved successfully', { warehouses, count: warehouses.length });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching warehouses');
  }
};

export const getWarehouseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: {
        inventories: {
          include: { product: { include: { category: true, supplier: true } } }
        }
      }
    });
    if (!warehouse) {
      sendError(res, 404, 'Warehouse not found');
      return;
    }
    sendSuccess(res, 200, 'Warehouse retrieved successfully', { warehouse });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching warehouse');
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    const warehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: req.body
    });
    sendSuccess(res, 200, 'Warehouse updated successfully', { warehouse });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error updating warehouse');
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    await prisma.warehouse.delete({ where: { id: warehouseId } });
    sendSuccess(res, 200, 'Warehouse deleted successfully', null);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error deleting warehouse');
  }
};

// ==================== CATEGORY CONTROLLER ====================
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categoryData = req.body;
    const category = await prisma.category.create({ data: categoryData });
    sendSuccess(res, 201, 'Category created successfully', { category });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error creating category');
  }
};

export const getAllCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: { id: true, name: true, sku: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    sendSuccess(res, 200, 'Categories retrieved successfully', { categories, count: categories.length });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching categories');
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: req.body
    });
    sendSuccess(res, 200, 'Category updated successfully', { category });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error updating category');
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    await prisma.category.delete({ where: { id: categoryId } });
    sendSuccess(res, 200, 'Category deleted successfully', null);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error deleting category');
  }
};

// ==================== STOCK MOVEMENT CONTROLLER ====================
export const createStockMovement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { productId, warehouseId, quantity, type, notes } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      sendError(res, 404, 'Product not found');
      return;
    }

    // Check if warehouse exists
    const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      sendError(res, 404, 'Warehouse not found');
      return;
    }

    // Find or create inventory record
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

    // Calculate new quantity
    let newQuantity = inventory.quantity;
    if (type === 'IN' || type === 'ADJUSTMENT') {
      newQuantity += quantity;
    } else if (type === 'OUT') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        sendError(res, 400, 'Insufficient stock');
        return;
      }
    }

    // Create stock movement and update inventory in a transaction
    const [stockMovement, updatedInventory] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId,
          warehouseId,
          quantity,
          type,
          notes,
          userId: req.user.id
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

    sendSuccess(res, 201, 'Stock movement recorded successfully', {
      stockMovement,
      inventory: updatedInventory
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error recording stock movement');
  }
};

export const getAllStockMovements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, warehouseId, type, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (warehouseId) where.warehouseId = warehouseId as string;
    if (type) where.type = type;

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

    sendSuccess(res, 200, 'Stock movements retrieved successfully', {
      movements,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching stock movements');
  }
};

export const getInventoryByWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;

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

    sendSuccess(res, 200, 'Inventory retrieved successfully', { inventory, count: inventory.length });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching inventory');
  }
};

export const getStockReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        inventories: {
          include: { warehouse: true }
        }
      }
    });

    const report = products.map(product => {
      const totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
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
        warehouseBreakdown: product.inventories.map(inv => ({
          warehouse: inv.warehouse.name,
          quantity: inv.quantity
        }))
      };
    });

    const totalValue = report.reduce((sum, item) => sum + item.stockValue, 0);
    const lowStockCount = report.filter(item => item.isLowStock).length;

    sendSuccess(res, 200, 'Stock report generated successfully', {
      report,
      summary: {
        totalProducts: products.length,
        totalStockValue: totalValue,
        lowStockProducts: lowStockCount
      }
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error generating stock report');
  }
};
