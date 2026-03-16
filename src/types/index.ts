import { Request } from 'express';
import { UserRole as PrismaUserRole } from '@prisma/client';

// ✅ Re-export Prisma's generated enums
export { UserRole, StockMovementType } from '@prisma/client';

// export enum StockMovementType {
//   IN = 'IN',
//   OUT = 'OUT',
//   ADJUSTMENT = 'ADJUSTMENT'
// }

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: PrismaUserRole;
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
