import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
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
