import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(err instanceof AppError)) {
    err = new AppError('Algo deu errado!', 500);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
