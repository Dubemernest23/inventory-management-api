import { Response } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

export const getBusinessContext = (req: AuthRequest, res: Response) => {
  if (!req.business) {
    sendError(res, 400, 'Business context is required. Provide x-business-id header.');
    return null;
  }

  return req.business;
};
