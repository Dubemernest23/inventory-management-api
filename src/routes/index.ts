import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { UserRole } from '../types';

// Supplier routes
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController';
import { createSupplierSchema, updateSupplierSchema } from '../utils/validation';

export const supplierRoutes = Router();
supplierRoutes.use(authenticate);
supplierRoutes.get('/', getAllSuppliers);
supplierRoutes.get('/:supplierId', getSupplierById);
supplierRoutes.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(createSupplierSchema), createSupplier);
supplierRoutes.patch('/:supplierId', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(updateSupplierSchema), updateSupplier);
supplierRoutes.delete('/:supplierId', authorize(UserRole.ADMIN), deleteSupplier);

// Warehouse routes
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
} from '../controllers/inventoryController';
import { createWarehouseSchema, updateWarehouseSchema } from '../utils/validation';

export const warehouseRoutes = Router();
warehouseRoutes.use(authenticate);
warehouseRoutes.get('/', getAllWarehouses);
warehouseRoutes.get('/:warehouseId', getWarehouseById);
warehouseRoutes.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(createWarehouseSchema), createWarehouse);
warehouseRoutes.patch('/:warehouseId', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(updateWarehouseSchema), updateWarehouse);
warehouseRoutes.delete('/:warehouseId', authorize(UserRole.ADMIN), deleteWarehouse);

// Category routes
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../controllers/inventoryController';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';

export const categoryRoutes = Router();
categoryRoutes.use(authenticate);
categoryRoutes.get('/', getAllCategories);
categoryRoutes.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(createCategorySchema), createCategory);
categoryRoutes.patch('/:categoryId', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(updateCategorySchema), updateCategory);
categoryRoutes.delete('/:categoryId', authorize(UserRole.ADMIN), deleteCategory);

// Stock movement routes
import {
  createStockMovement,
  getAllStockMovements,
  getInventoryByWarehouse,
  getStockReport
} from '../controllers/inventoryController';
import { createStockMovementSchema } from '../utils/validation';

export const stockRoutes = Router();
stockRoutes.use(authenticate);
stockRoutes.get('/movements', getAllStockMovements);
stockRoutes.post('/movements', validate(createStockMovementSchema), createStockMovement);
stockRoutes.get('/warehouse/:warehouseId', getInventoryByWarehouse);
stockRoutes.get('/report', authorize(UserRole.ADMIN, UserRole.MANAGER), getStockReport);
