import axios from 'axios';
import Store from '../models/storeModel';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

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

// create store

export const getAllStores = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const stores = await Store.find();
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

    console.log(geocodeData);

    // Calcular distancia

    res.status(200).json({
      status: 'success',
    });
    // const data = await response.json();
  }
);
