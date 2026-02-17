import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { sendError, sendSuccess } from '../utils/response';

export const createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supplierData = req.body;

    const supplier = await prisma.supplier.create({
      data: supplierData
    });

    sendSuccess(res, 201, 'Supplier created successfully', { supplier });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error creating supplier');
  }
};

export const getAllSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          products: {
            select: { id: true, name: true, sku: true }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplier.count({ where })
    ]);

    sendSuccess(res, 200, 'Suppliers retrieved successfully', {
      suppliers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching suppliers');
  }
};

export const getSupplierById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        products: true
      }
    });

    if (!supplier) {
      sendError(res, 404, 'Supplier not found');
      return;
    }

    sendSuccess(res, 200, 'Supplier retrieved successfully', { supplier });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching supplier');
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const updateData = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData
    });

    sendSuccess(res, 200, 'Supplier updated successfully', { supplier });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error updating supplier');
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    await prisma.supplier.delete({
      where: { id: supplierId }
    });

    sendSuccess(res, 200, 'Supplier deleted successfully', null);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error deleting supplier');
  }
};
