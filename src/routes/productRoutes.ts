import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} from '../controllers/productController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createProductSchema, updateProductSchema } from '../utils/validation';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:productId', getProductById);
router.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(createProductSchema), createProduct);
router.patch('/:productId', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(updateProductSchema), updateProduct);
router.delete('/:productId', authorize(UserRole.ADMIN), deleteProduct);

export default router;
