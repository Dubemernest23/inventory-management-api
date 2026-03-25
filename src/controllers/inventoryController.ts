import { Response } from 'express';
import { handleControllerError } from '../__helper__/handleControllerError';
import { AuthRequest } from '../types';
import { getBusinessContext } from '../__helper__/getBusinessContext';
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
import { sendError, sendSuccess } from '../utils/response';

// ==================== WAREHOUSE CONTROLLER ====================
export const createWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const warehouse = await createWarehouseService(business.id, req.body);
    sendSuccess(res, 201, 'Warehouse created successfully', { warehouse });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating warehouse');
  }
};

export const getAllWarehouses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const warehouses = await getAllWarehousesService(business.id);
    sendSuccess(res, 200, 'Warehouses retrieved successfully', { warehouses, count: warehouses.length });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching warehouses');
  }
};

export const getWarehouseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { warehouseId } = req.params;
    const warehouse = await getWarehouseByIdService(business.id, warehouseId);
    sendSuccess(res, 200, 'Warehouse retrieved successfully', { warehouse });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching warehouse');
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { warehouseId } = req.params;
    const warehouse = await updateWarehouseService(business.id, warehouseId, req.body);
    sendSuccess(res, 200, 'Warehouse updated successfully', { warehouse });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating warehouse');
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { warehouseId } = req.params;
    await deleteWarehouseService(business.id, warehouseId);
    sendSuccess(res, 200, 'Warehouse deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting warehouse');
  }
};

// ==================== CATEGORY CONTROLLER ====================
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const category = await createCategoryService(business.id, req.body);
    sendSuccess(res, 201, 'Category created successfully', { category });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating category');
  }
};

export const getAllCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const categories = await getAllCategoriesService(business.id);
    sendSuccess(res, 200, 'Categories retrieved successfully', { categories, count: categories.length });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching categories');
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { categoryId } = req.params;
    const category = await updateCategoryService(business.id, categoryId, req.body);
    sendSuccess(res, 200, 'Category updated successfully', { category });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating category');
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { categoryId } = req.params;
    await deleteCategoryService(business.id, categoryId);
    sendSuccess(res, 200, 'Category deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting category');
  }
};

// ==================== STOCK MOVEMENT CONTROLLER ====================
export const createStockMovement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const data = await createStockMovementService(business.id, req.body, req.user.id);

    sendSuccess(res, 201, 'Stock movement recorded successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error recording stock movement');
  }
};

export const getAllStockMovements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const data = await getAllStockMovementsService(
      business.id,
      req.query as Record<string, string | undefined>
    );

    sendSuccess(res, 200, 'Stock movements retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching stock movements');
  }
};

export const getInventoryByWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { warehouseId } = req.params;
    const data = await getInventoryByWarehouseService(business.id, warehouseId);

    sendSuccess(res, 200, 'Inventory retrieved successfully', { ...data });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching inventory');
  }
};

export const getStockReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const data = await getStockReportService(business.id);

    sendSuccess(res, 200, 'Stock report generated successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error generating stock report');
  }
};
