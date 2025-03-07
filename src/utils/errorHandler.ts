import { Request, Response, NextFunction } from 'express';
import AppError from './appError';
import logger from './logger';

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(err instanceof AppError)) {
    err = new AppError('Algo deu errado!', 500);
  }

  if (err.statusCode >= 500) {
    logger.error(
      `[${err.statusCode}] ${err.message} - ${req.method} ${req.originalUrl}`
    );
  } else {
    logger.warn(
      `[${err.statusCode}] ${err.message} - ${req.method} ${req.originalUrl}`
    );
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
