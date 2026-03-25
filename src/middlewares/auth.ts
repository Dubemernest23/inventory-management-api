import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest, BusinessRole, UserRole } from '../types';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'No token provided. Please authenticate.');
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      sendError(res, 401, 'Invalid or expired token. Please login again.');
      return;
    }
  } catch (error) {
    sendError(res, 500, 'Authentication error');
    return;
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'User not authenticated');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 403, 'You do not have permission to perform this action');
      return;
    }

    next();
  };
};

export const requireBusinessAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'User not authenticated');
      return;
    }

    const headerValue = req.headers['x-business-id'];
    const businessId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!businessId) {
      sendError(res, 400, 'x-business-id header is required');
      return;
    }

    const membership = await prisma.userBusinessRole.findUnique({
      where: {
        userId_businessId: {
          userId: req.user.id,
          businessId
        }
      },
      select: {
        businessId: true,
        role: true,
        isActive: true
      }
    });

    if (!membership || !membership.isActive) {
      sendError(res, 403, 'You do not have access to this business');
      return;
    }

    req.business = {
      id: membership.businessId,
      role: membership.role
    };

    next();
  } catch (error) {
    sendError(res, 500, 'Business access validation failed');
  }
};

export const authorizeBusiness = (...roles: BusinessRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.business) {
      sendError(res, 400, 'Business context is missing');
      return;
    }

    if (!roles.includes(req.business.role)) {
      sendError(res, 403, 'You do not have permission to perform this action');
      return;
    }

    next();
  };
};
