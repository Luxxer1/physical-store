import Store from '../models/storeModel';
import { Request, Response } from 'express';
import fetch from 'node-fetch';

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

export const getAllStores = async (
  req: Request,
  res: Response
): Promise<void> => {
  const stores = await Store.find();
  res.status(200).json({
    status: 'success',
    data: {
      stores,
    },
  });
};

export const getNearbyStores = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { cep } = req.params;

  if (!/^\d{8}$/.test(cep)) {
    res.status(400).json({
      status: 'error',
      message: 'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
    });
    return;
  }

  try {
    const cepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!cepResponse.ok) {
      res.status(404).json({
        status: 'error',
        message: 'Erro ao acessar a API do ViaCEP',
      });
      return;
    }

    const cepData = (await cepResponse.json()) as CepResponse;

    if (cepData.erro) {
      res.status(404).json({
        status: 'error',
        message: 'CEP não encontrado',
      });
      return;
    }

    // Calcular distancia

    console.log(cepData);

    res.status(200).json({
      status: 'success',
    });
    // const data = await response.json();
  } catch (err) {
    res.status(500).json({
      status: 'error',
    });
  }
};
