import {
  BusinessRole,
  CostingMethod,
  ProductStatus,
  StockMovementType,
  SubscriptionTier
} from '@prisma/client';
import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Business validation schemas
export const createBusinessSchema = z.object({
  name: z.string().min(2).max(150),
  industryType: z.string().max(100).optional(),
  address: z.string().max(1000).optional(),
  currency: z.string().min(3).max(8).optional(),
  timezone: z.string().min(2).max(100).optional(),
  costingMethod: z.nativeEnum(CostingMethod).optional(),
  subscriptionTier: z.nativeEnum(SubscriptionTier).optional(),
  logoUrl: z.string().url().optional()
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(BusinessRole),
  expiresInHours: z.number().int().min(1).max(168).optional()
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1)
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(BusinessRole)
});

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z.string().min(1, 'SKU is required').max(50),
  barcode: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  tags: z.any().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().positive().optional(),
  minStock: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional()
});

export const updateProductSchema = createProductSchema.partial();

// Product variants
export const createProductVariantSchema = z.object({
  name: z.string().min(1).max(120),
  sku: z.string().min(1).max(60),
  barcode: z.string().max(60).optional(),
  attributes: z.record(z.any()),
  status: z.nativeEnum(ProductStatus).optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  minStock: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).optional()
});

export const updateProductVariantSchema = createProductVariantSchema.partial();

// Product images
export const createProductImageSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(300).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional()
});

export const updateProductImageSchema = createProductImageSchema.partial();

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
  variantId: z.string().uuid('Invalid variant ID').optional(),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  type: z.nativeEnum(StockMovementType),
  reason: z.string().max(120).optional(),
  unitCost: z.number().positive().optional(),
  notes: z.string().max(500).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
