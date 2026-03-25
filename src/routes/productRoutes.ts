import { Router } from 'express';
import {
  createProductImage,
  createProductVariant,
  deleteProductImage,
  deleteProductVariant,
  getProductImages,
  getProductVariants,
  updateProductImage,
  updateProductVariant
} from '../controllers/productCatalogController';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} from '../controllers/productController';
import { authenticate, authorizeBusiness, requireBusinessAccess } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createProductImageSchema,
  createProductSchema,
  createProductVariantSchema,
  updateProductImageSchema,
  updateProductSchema,
  updateProductVariantSchema
} from '../utils/validation';
import { BusinessRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate, requireBusinessAccess);

router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:productId/variants', getProductVariants);
router.post(
  '/:productId/variants',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(createProductVariantSchema),
  createProductVariant
);
router.patch(
  '/:productId/variants/:variantId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(updateProductVariantSchema),
  updateProductVariant
);
router.delete(
  '/:productId/variants/:variantId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  deleteProductVariant
);
router.get('/:productId/images', getProductImages);
router.post(
  '/:productId/images',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(createProductImageSchema),
  createProductImage
);
router.patch(
  '/:productId/images/:imageId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(updateProductImageSchema),
  updateProductImage
);
router.delete(
  '/:productId/images/:imageId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  deleteProductImage
);
router.get('/:productId', getProductById);
router.post(
  '/',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(createProductSchema),
  createProduct
);
router.patch(
  '/:productId',
  authorizeBusiness(BusinessRole.OWNER, BusinessRole.MANAGER),
  validate(updateProductSchema),
  updateProduct
);
router.delete('/:productId', authorizeBusiness(BusinessRole.OWNER), deleteProduct);

export default router;
