import Store from '../models/storeModel';
import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
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
      res.status(400).json({
        status: 'error',
        message: 'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
      });
      return;
    }

    const cepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!cepResponse.ok) {
      return next(new AppError('Erro ao acessar a API do ViaCEP', 404));
    }

    const cepData = (await cepResponse.json()) as CepResponse;

    if (cepData.erro) {
      return next(new AppError('CEP não encontrado', 404));
    }

    // Calcular distancia

    console.log(cepData);

    res.status(200).json({
      status: 'success',
    });
    // const data = await response.json();
  }
);
