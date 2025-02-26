import { Request, Response } from 'express';

export const getAllStores = (req: Request, res: Response): void => {
  console.log('hello from controller');
  res.status(200).json({
    status: 'success',
  });
};
