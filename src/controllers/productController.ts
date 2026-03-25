import { Response } from 'express';
import { handleControllerError } from '../__helper__/handleControllerError';
import { AuthRequest } from '../types';
import { getBusinessContext } from '../__helper__/getBusinessContext';
import {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getLowStockProductsService,
  getProductByIdService,
  updateProductService
} from '../services/productService';
import { sendSuccess } from '../utils/response';

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const product = await createProductService(business.id, req.body);

    sendSuccess(res, 201, 'Product created successfully', { product });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating product');
  }
};

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const data = await getAllProductsService(
      business.id,
      req.query as Record<string, string | undefined>
    );

    sendSuccess(res, 200, 'Products retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching products');
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId } = req.params;
    const product = await getProductByIdService(business.id, productId);

    sendSuccess(res, 200, 'Product retrieved successfully', {
      product
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching product');
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId } = req.params;
    const product = await updateProductService(business.id, productId, req.body);

    sendSuccess(res, 200, 'Product updated successfully', { product });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating product');
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { productId } = req.params;

    await deleteProductService(business.id, productId);

    sendSuccess(res, 200, 'Product deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting product');
  }
};

export const getLowStockProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const data = await getLowStockProductsService(business.id);

    sendSuccess(res, 200, 'Low stock products retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching low stock products');
  }
};
