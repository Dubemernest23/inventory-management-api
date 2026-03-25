import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/response';

interface GetAllSuppliersParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
}

export const createSupplierService = async (
  businessId: string,
  supplierData: Prisma.SupplierUncheckedCreateInput
) => {
  return prisma.supplier.create({
    data: {
      ...supplierData,
      businessId
    }
  });
};

export const getAllSuppliersService = async (businessId: string, params: GetAllSuppliersParams) => {
  const { page = 1, limit = 10, search } = params;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.SupplierWhereInput = { businessId };
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

export const getSupplierByIdService = async (businessId: string, supplierId: string) => {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      businessId
    },
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
  businessId: string,
  supplierId: string,
  updateData: Prisma.SupplierUncheckedUpdateInput
) => {
  const existingSupplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      businessId
    },
    select: { id: true }
  });

  if (!existingSupplier) {
    throw new AppError('Supplier not found', 404);
  }

  return prisma.supplier.update({
    where: { id: existingSupplier.id },
    data: updateData
  });
};

export const deleteSupplierService = async (businessId: string, supplierId: string) => {
  const existingSupplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      businessId
    },
    select: { id: true }
  });

  if (!existingSupplier) {
    throw new AppError('Supplier not found', 404);
  }

  await prisma.supplier.delete({
    where: { id: existingSupplier.id }
  });
};
