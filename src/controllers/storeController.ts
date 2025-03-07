import axios from 'axios';
import Store from '../models/storeModel';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import logger from '../utils/logger';
import { getNearbyStoresWithDistance } from '../utils/storeService';
import StoreFormatter from '../utils/storeFormatter';
StoreFormatter;

interface CepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const getAllStores = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.info('Buscando todas as lojas...');

    const stores = await Store.find();

    if (stores.length === 0) {
      return next(new AppError('Nenhuma loja encontrada', 404));
    }

    logger.info('Todas as lojas encontradas com sucesso.');

    res.status(200).json({
      status: 'success',
      data: {
        stores,
      },
    });
  }
);

export const getNearbyStores = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cep } = req.params;

    if (!/^\d{8}$/.test(cep)) {
      return next(
        new AppError(
          'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
          400
        )
      );
    }

    const { data: cepData } = await axios.get<CepResponse>(
      `https://viacep.com.br/ws/${cep}/json/`
    );

    if (cepData.erro) {
      return next(new AppError('CEP não encontrado.', 404));
    }

    const address = encodeURIComponent(
      `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`
    );

    if (!process.env.API_KEY) {
      return next(new AppError('API KEY não definida', 500));
    }

    const { data: geocodeData } = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY}`
    );

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return next(
        new AppError('Não foi possível obter as coordenadas do endereço.', 404)
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const origin = `${lat},${lng}`;

    logger.info(`Buscando lojas próximas ao CEP: ${cep}`);

    const nearbyStores = await getNearbyStoresWithDistance(origin);

    if (nearbyStores.length === 0) {
      return next(
        new AppError(`Nenhuma loja encontrada próxima ao CEP: ${cep}`, 404)
      );
    }

    const formattedStores = new StoreFormatter(nearbyStores).sort().format();

    if (formattedStores.length === 1) {
      logger.info(`1 loja encontrada próxima ao CEP: ${cep}`);
    } else {
      logger.info(
        `${formattedStores.length} lojas encontradas próximas ao CEP: ${cep}`
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        stores: formattedStores,
      },
    });
  }
);
