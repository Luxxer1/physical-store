import Store from '../models/storeModel';
import { Request, Response } from 'express';
// import fetch from 'node-fetch';

export const getAllStores = async (
  req: Request,
  res: Response
): Promise<void> => {
  const stores = await Store.find();
  // const response = await fetch('https://viacep.com.br/ws/50930070/json/');
  // const data = await response.json();

  console.log(stores);
  res.status(200).json({
    status: 'success',
  });
};

export const getNearbyStores = async (
  req: Request,
  res: Response
): Promise<void> => {};
