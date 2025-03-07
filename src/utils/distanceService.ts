import axios from 'axios';
import AppError from './appError';

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
  return distance / 1000;
};
