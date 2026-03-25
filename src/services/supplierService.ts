import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/response';

interface GetAllSuppliersParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
}

export const createSupplierService = async (supplierData: Prisma.SupplierUncheckedCreateInput) => {
  return prisma.supplier.create({
    data: supplierData
  });
};

export const getAllSuppliersService = async (params: GetAllSuppliersParams) => {
  const { page = 1, limit = 10, search } = params;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.SupplierWhereInput = {};
  if (search) {
    where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
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

  return {
    suppliers,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

export const getSupplierByIdService = async (supplierId: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      products: true
    }
  });

  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  return supplier;
};

export const updateSupplierService = async (
  supplierId: string,
  updateData: Prisma.SupplierUncheckedUpdateInput
) => {
  return prisma.supplier.update({
    where: { id: supplierId },
    data: updateData
  });
};

export const deleteSupplierService = async (supplierId: string) => {
  await prisma.supplier.delete({
    where: { id: supplierId }
  });
};
