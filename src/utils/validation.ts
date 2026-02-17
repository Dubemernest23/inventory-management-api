import { z } from 'zod';
import { UserRole, StockMovementType } from '../types';

// Auth validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z.string().min(1, 'SKU is required').max(50),
  barcode: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().positive().optional(),
  minStock: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional()
});

export const updateProductSchema = createProductSchema.partial();

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional()
});

export const updateCategorySchema = createCategorySchema.partial();

// Supplier validation schemas
export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(200),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  description: z.string().max(1000).optional()
});

export const updateSupplierSchema = createSupplierSchema.partial();

// Warehouse validation schemas
export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(200),
  location: z.string().min(1, 'Location is required').max(300),
  capacity: z.number().int().positive().optional(),
  description: z.string().max(1000).optional()
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

// Stock movement validation schemas
export const createStockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  type: z.nativeEnum(StockMovementType),
  notes: z.string().max(500).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
