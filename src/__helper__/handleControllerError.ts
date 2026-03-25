import { Response } from 'express';
import { AppError, sendError} from '../utils/response';

export const handleControllerError = (res: Response, error: unknown, fallbackMessage: string): void => {
    if (error instanceof AppError) {
        sendError(res, error.statusCode, error.message);
        return;
    }

    if (error instanceof Error) {
        sendError(res, 500, error.message || fallbackMessage);
        return;
    }

  sendError(res, 500, fallbackMessage);
};