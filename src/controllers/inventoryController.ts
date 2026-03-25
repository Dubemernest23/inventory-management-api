import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  createCategoryService,
  createStockMovementService,
  createWarehouseService,
  deleteCategoryService,
  deleteWarehouseService,
  getAllCategoriesService,
  getAllStockMovementsService,
  getAllWarehousesService,
  getInventoryByWarehouseService,
  getStockReportService,
  getWarehouseByIdService,
  updateCategoryService,
  updateWarehouseService
} from '../services/inventoryService';
import { AppError, sendError, sendSuccess } from '../utils/response';

const handleControllerError = (res: Response, error: unknown, fallbackMessage: string): void => {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message);
    return;
  }

  if (error instanceof Error) {
    sendError(res, 500, error.message || fallbackMessage);
    return;
  }

  sendError(res, 500, fallbackMessage);
};

// ==================== WAREHOUSE CONTROLLER ====================
export const createWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouse = await createWarehouseService(req.body);
    sendSuccess(res, 201, 'Warehouse created successfully', { warehouse });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating warehouse');
  }
};

export const getAllWarehouses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await getAllWarehousesService();
    sendSuccess(res, 200, 'Warehouses retrieved successfully', { warehouses, count: warehouses.length });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching warehouses');
  }
};

export const getWarehouseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    const warehouse = await getWarehouseByIdService(warehouseId);
    sendSuccess(res, 200, 'Warehouse retrieved successfully', { warehouse });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching warehouse');
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    const warehouse = await updateWarehouseService(warehouseId, req.body);
    sendSuccess(res, 200, 'Warehouse updated successfully', { warehouse });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating warehouse');
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    await deleteWarehouseService(warehouseId);
    sendSuccess(res, 200, 'Warehouse deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting warehouse');
  }
};

// ==================== CATEGORY CONTROLLER ====================
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await createCategoryService(req.body);
    sendSuccess(res, 201, 'Category created successfully', { category });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating category');
  }
};

export const getAllCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await getAllCategoriesService();
    sendSuccess(res, 200, 'Categories retrieved successfully', { categories, count: categories.length });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching categories');
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const category = await updateCategoryService(categoryId, req.body);
    sendSuccess(res, 200, 'Category updated successfully', { category });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating category');
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    await deleteCategoryService(categoryId);
    sendSuccess(res, 200, 'Category deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting category');
  }
};

// ==================== STOCK MOVEMENT CONTROLLER ====================
export const createStockMovement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const data = await createStockMovementService(req.body, req.user.id);

    sendSuccess(res, 201, 'Stock movement recorded successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error recording stock movement');
  }
};

export const getAllStockMovements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getAllStockMovementsService(req.query as Record<string, string | undefined>);

    sendSuccess(res, 200, 'Stock movements retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching stock movements');
  }
};

export const getInventoryByWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;
    const data = await getInventoryByWarehouseService(warehouseId);

    sendSuccess(res, 200, 'Inventory retrieved successfully', { ...data });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching inventory');
  }
};

export const getStockReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getStockReportService();

    sendSuccess(res, 200, 'Stock report generated successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error generating stock report');
  }
};
