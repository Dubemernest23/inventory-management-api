import { Router } from 'express';
import { authenticate, authorizeBusiness, requireBusinessAccess } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { BusinessRole } from '../types';

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
supplierRoutes.use(authenticate, requireBusinessAccess);
supplierRoutes.get('/', getAllSuppliers);
supplierRoutes.get('/:supplierId', getSupplierById);
supplierRoutes.post(
  '/',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(createSupplierSchema),
  createSupplier
);
supplierRoutes.patch(
  '/:supplierId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(updateSupplierSchema),
  updateSupplier
);
supplierRoutes.delete('/:supplierId', authorizeBusiness(BusinessRole.OWNER), deleteSupplier);

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
warehouseRoutes.use(authenticate, requireBusinessAccess);
warehouseRoutes.get('/', getAllWarehouses);
warehouseRoutes.get('/:warehouseId', getWarehouseById);
warehouseRoutes.post(
  '/',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(createWarehouseSchema),
  createWarehouse
);
warehouseRoutes.patch(
  '/:warehouseId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(updateWarehouseSchema),
  updateWarehouse
);
warehouseRoutes.delete('/:warehouseId', authorizeBusiness(BusinessRole.OWNER), deleteWarehouse);

// Category routes
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../controllers/inventoryController';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';

export const categoryRoutes = Router();
categoryRoutes.use(authenticate, requireBusinessAccess);
categoryRoutes.get('/', getAllCategories);
categoryRoutes.post(
  '/',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(createCategorySchema),
  createCategory
);
categoryRoutes.patch(
  '/:categoryId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(updateCategorySchema),
  updateCategory
);
categoryRoutes.delete('/:categoryId', authorizeBusiness(BusinessRole.OWNER), deleteCategory);

// Stock movement routes
import {
  createStockMovement,
  getAllStockMovements,
  getInventoryByWarehouse,
  getStockReport
} from '../controllers/inventoryController';
import { createStockMovementSchema } from '../utils/validation';

export const stockRoutes = Router();
stockRoutes.use(authenticate, requireBusinessAccess);
stockRoutes.get('/movements', getAllStockMovements);
stockRoutes.post('/movements', validate(createStockMovementSchema), createStockMovement);
stockRoutes.get('/warehouse/:warehouseId', getInventoryByWarehouse);
stockRoutes.get('/report', authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER), getStockReport);
