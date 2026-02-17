import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.[0] || 'field';
      res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found'
      });
      return;
    }
  }

  // Default error
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};
