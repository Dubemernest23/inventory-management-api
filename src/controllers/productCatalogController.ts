import { Response } from 'express';
import { getBusinessContext } from '../__helper__/getBusinessContext';
import { handleControllerError } from '../__helper__/handleControllerError';
import { AuthRequest } from '../types';
import {
  createProductImageService,
  createProductVariantService,
  deleteProductImageService,
  deleteProductVariantService,
  getProductImagesService,
  getProductVariantsService,
  updateProductImageService,
  updateProductVariantService
} from '../services/productService';
import { sendSuccess } from '../utils/response';

export const getProductVariants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId } = req.params;
    const variants = await getProductVariantsService(business.id, productId);
    sendSuccess(res, 200, 'Product variants retrieved successfully', {
      variants,
      count: variants.length
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching product variants');
  }
};

export const createProductVariant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId } = req.params;
    const variant = await createProductVariantService(business.id, productId, req.body);
    sendSuccess(res, 201, 'Product variant created successfully', { variant });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating product variant');
  }
};

export const updateProductVariant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId, variantId } = req.params;
    const variant = await updateProductVariantService(business.id, productId, variantId, req.body);
    sendSuccess(res, 200, 'Product variant updated successfully', { variant });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating product variant');
  }
};

export const deleteProductVariant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId, variantId } = req.params;
    await deleteProductVariantService(business.id, productId, variantId);
    sendSuccess(res, 200, 'Product variant deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting product variant');
  }
};

export const getProductImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId } = req.params;
    const images = await getProductImagesService(business.id, productId);
    sendSuccess(res, 200, 'Product images retrieved successfully', {
      images,
      count: images.length
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching product images');
  }
};

export const createProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId } = req.params;
    const image = await createProductImageService(business.id, productId, req.body);
    sendSuccess(res, 201, 'Product image created successfully', { image });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating product image');
  }
};

export const updateProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId, imageId } = req.params;
    const image = await updateProductImageService(business.id, productId, imageId, req.body);
    sendSuccess(res, 200, 'Product image updated successfully', { image });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating product image');
  }
};

export const deleteProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId, imageId } = req.params;
    await deleteProductImageService(business.id, productId, imageId);
    sendSuccess(res, 200, 'Product image deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting product image');
  }
};
