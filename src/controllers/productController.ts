import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getLowStockProductsService,
  getProductByIdService,
  updateProductService
} from '../services/productService';
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

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await createProductService(req.body);

    sendSuccess(res, 201, 'Product created successfully', { product });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating product');
  }
};

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getAllProductsService(req.query as Record<string, string | undefined>);

    sendSuccess(res, 200, 'Products retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching products');
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await getProductByIdService(productId);

    sendSuccess(res, 200, 'Product retrieved successfully', {
      product
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching product');
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await updateProductService(productId, req.body);

    sendSuccess(res, 200, 'Product updated successfully', { product });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating product');
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    await deleteProductService(productId);

    sendSuccess(res, 200, 'Product deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting product');
  }
};

export const getLowStockProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getLowStockProductsService();

    sendSuccess(res, 200, 'Low stock products retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching low stock products');
  }
};
