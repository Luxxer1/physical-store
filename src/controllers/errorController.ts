import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

// Middleware de erro
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Se o erro não for uma instância de AppError, criamos um erro genérico
  if (!(err instanceof AppError)) {
    err = new AppError('Algo deu errado!', 500);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
