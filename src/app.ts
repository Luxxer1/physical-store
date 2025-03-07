import express from 'express';
import { Request, Response, NextFunction } from 'express';
import storeRouter from './routes/storeRoutes';
import AppError from './utils/appError';
import { globalErrorHandler } from './utils/errorHandler';

const app = express();

app.use(express.json());

app.use('/stores', storeRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(
      `Não foi possível encontrar ${req.originalUrl} no servidor`,
      404
    )
  );
});

app.use(globalErrorHandler);

export default app;
