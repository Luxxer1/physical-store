import axios from 'axios';
import Store from '../models/storeModel';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import logger from '../utils/logger';

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
    const stores = await Store.find();
    logger.info('Buscando todas as lojas...');
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
    let { cep } = req.params;

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

    console.log(cepData);

    const address = encodeURIComponent(`
      ${cepData.logradouro},
      ${cepData.bairro},
      ${cepData.localidade},
      ${cepData.uf}
    `);

    if (!process.env.API_KEY) {
      throw new Error('API KEY is not defined');
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

    const stores = await Store.find();

    const nearbyStores = [];
    for (const store of stores) {
      if (store.location && store.location.coordinates) {
        const [storeLng, storeLat] = store.location.coordinates;
        const destination = `${storeLat},${storeLng}`;

        const distance = await calculateDistance(origin, destination);

        if (distance <= 100) {
          nearbyStores.push({
            ...store.toObject(),
            distance: `${distance} km`,
            numericDistance: distance,
          });
        }
      }
    }

    nearbyStores.sort((a, b) => a.numericDistance - b.numericDistance);

    nearbyStores.forEach((store) => {
      const storeOptionalFields = store as Partial<typeof store>;
      delete storeOptionalFields.numericDistance;
    });

    res.status(200).json({
      status: 'success',
      data: {
        stores: nearbyStores,
      },
    });
  }
);

const calculateDistance = async (
  origin: string,
  destination: string
): Promise<number> => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.API_KEY}`
  );

  if (data.status !== 'OK' || !data.routes || !data.routes.length) {
    throw new Error('Não foi possível calcular a distância.');
  }

  const distance = data.routes[0].legs[0].distance.value;
  return distance / 1000;
};
