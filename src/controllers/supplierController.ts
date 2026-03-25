import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  createSupplierService,
  deleteSupplierService,
  getAllSuppliersService,
  getSupplierByIdService,
  updateSupplierService
} from '../services/supplierService';
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

export const createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supplier = await createSupplierService(req.body);

    sendSuccess(res, 201, 'Supplier created successfully', { supplier });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating supplier');
  }
};

export const getAllSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getAllSuppliersService(req.query as Record<string, string | undefined>);

    sendSuccess(res, 200, 'Suppliers retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching suppliers');
  }
};

export const getSupplierById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const supplier = await getSupplierByIdService(supplierId);

    sendSuccess(res, 200, 'Supplier retrieved successfully', { supplier });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching supplier');
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const supplier = await updateSupplierService(supplierId, req.body);

    sendSuccess(res, 200, 'Supplier updated successfully', { supplier });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating supplier');
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    await deleteSupplierService(supplierId);

    sendSuccess(res, 200, 'Supplier deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting supplier');
  }
};
