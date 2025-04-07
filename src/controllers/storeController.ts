import Store from '../models/storeModel';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import logger from '../utils/logger';
import { findNearbyStoresFromCep } from '../utils/storeService';
import StoreFormatter from '../utils/storeFormatter';
StoreFormatter;

export const getAllStores = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.info('Buscando todas as lojas...');

    const stores = await Store.find().lean();

    if (stores.length === 0) {
      return next(new AppError('Nenhuma loja encontrada', 404));
    }

    logger.info('Todas as lojas encontradas com sucesso.');

    const formattedStores = new StoreFormatter(stores).format();

    res.status(200).json({
      status: 'success',
      length: formattedStores.length,
      data: {
        stores: formattedStores,
      },
    });
  }
);

export const getNearbyStores = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cep } = req.params;

    if (!process.env.API_KEY) {
      return next(new AppError('API KEY não definida', 500));
    }

    const nearbyStores = await findNearbyStoresFromCep(cep);

    if (nearbyStores.length === 0) {
      return next(
        new AppError(`Nenhuma loja encontrada próxima ao CEP: ${cep}`, 404)
      );
    }

    const formattedStores = new StoreFormatter(nearbyStores).sort().format();

    logger.info(
      `${formattedStores.length} loja(s) encontrada(s) próxima(s) ao CEP: ${cep}`
    );

    res.status(200).json({
      status: 'success',
      length: formattedStores.length,
      data: {
        stores: formattedStores,
      },
    });
  }
);
