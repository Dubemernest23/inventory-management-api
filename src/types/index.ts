import { Request } from 'express';
import { BusinessRole as PrismaBusinessRole, UserRole as PrismaUserRole } from '@prisma/client';
export { BusinessRole, CostingMethod, StockMovementType, SubscriptionTier, UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: PrismaUserRole;
  };
  business?: {
    id: string;
    role: PrismaBusinessRole;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: PrismaUserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  warehouseId?: string;
  lowStock?: boolean;
}
