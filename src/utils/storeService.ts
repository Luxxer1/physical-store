import axios from 'axios';
import Store from '../models/storeModel';
import AppError from '../utils/appError';
import { CepResponse } from '../interfaces/store.interface';
import logger from './logger';

const MAX_DISTANCE_KM = 100;
const METERS_IN_KM = 1000;

export const isValidCep = (cep: string): boolean => {
  return /^\d{8}$/.test(cep);
};

export const fetchCepData = async (cep: string): Promise<CepResponse> => {
  const { data } = await axios.get<CepResponse>(
    `https://viacep.com.br/ws/${cep}/json/`
  );

  return data;
};

export const getCoordinatesFromAddress = async (cepData: CepResponse) => {
  const address = encodeURIComponent(
    `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`
  );

  const { data: geocodeData } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY}`
  );

  if (!geocodeData.results || geocodeData.results.length === 0) {
    throw new AppError(
      'Não foi possível obter as coordenadas do endereço.',
      404
    );
  }

  return geocodeData.results[0].geometry.location;
};

export const findNearbyStoresFromCep = async (cep: string): Promise<any[]> => {
  if (!isValidCep(cep)) {
    throw new AppError(
      'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
      400
    );
  }

  const cepData = await fetchCepData(cep);
  if (cepData.erro) {
    throw new AppError('CEP não encontrado.', 404);
  }

  const { lat, lng } = await getCoordinatesFromAddress(cepData);
  const origin = `${lat},${lng}`;

  logger.info(`Buscando lojas próximas ao CEP: ${cep}`);

  const nearbyStores = await getNearbyStoresWithDistance(origin);

  return nearbyStores;
};

export const calculateDistance = async (
  origin: string,
  destination: string
): Promise<number> => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.API_KEY}`
  );

  if (data.status !== 'OK' || !data.routes || !data.routes.length) {
    throw new AppError('Não foi possível calcular a distância.', 500);
  }

  const distance = data.routes[0].legs[0].distance.value;
  return distance / METERS_IN_KM;
};

export const getNearbyStoresWithDistance = async (
  origin: string
): Promise<any[]> => {
  const stores = await Store.find();

  const nearbyStores = [];

  for (const store of stores) {
    if (store.location && store.location.coordinates) {
      const [storeLng, storeLat] = store.location.coordinates;
      const destination = `${storeLat},${storeLng}`;

      const distance = await calculateDistance(origin, destination);

      if (distance <= MAX_DISTANCE_KM) {
        nearbyStores.push({
          ...store.toObject(),
          distance: `${distance} km`,
          numericDistance: distance,
        });
      }
    }
  }

  return nearbyStores;
};
