import axios from 'axios';
import Store from '../models/storeModel';
import AppError from '../utils/appError';

const MAX_DISTANCE_KM = 100;

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
