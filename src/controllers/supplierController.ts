import { Response } from 'express';
import { handleControllerError } from '../__helper__/handleControllerError';
import { AuthRequest } from '../types';
import { getBusinessContext } from '../__helper__/getBusinessContext';
import {
  createSupplierService,
  deleteSupplierService,
  getAllSuppliersService,
  getSupplierByIdService,
  updateSupplierService
} from '../services/supplierService';
import { sendSuccess } from '../utils/response';

export const createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const supplier = await createSupplierService(business.id, req.body);

    sendSuccess(res, 201, 'Supplier created successfully', { supplier });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating supplier');
  }
};

export const getAllSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const data = await getAllSuppliersService(
      business.id,
      req.query as Record<string, string | undefined>
    );

    sendSuccess(res, 200, 'Suppliers retrieved successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching suppliers');
  }
};

export const getSupplierById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { supplierId } = req.params;
    const supplier = await getSupplierByIdService(business.id, supplierId);

    sendSuccess(res, 200, 'Supplier retrieved successfully', { supplier });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching supplier');
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { supplierId } = req.params;
    const supplier = await updateSupplierService(business.id, supplierId, req.body);

    sendSuccess(res, 200, 'Supplier updated successfully', { supplier });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating supplier');
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = getBusinessContext(req, res);
    if (!business) {
      return;
    }

    const { supplierId } = req.params;

    await deleteSupplierService(business.id, supplierId);

    sendSuccess(res, 200, 'Supplier deleted successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deleting supplier');
  }
};
