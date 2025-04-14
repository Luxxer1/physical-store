import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './store.model';
import { HttpService } from '@nestjs/axios';
import logger from 'src/common/logger/logger';

@Injectable()
export class StoreService {
  private readonly MAX_DISTANCE_KM = 100;
  private readonly METERS_IN_KM = 1000;

  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly httpService: HttpService,
  ) {}

  async getAllStores() {
    logger.info('Buscando todas as lojas...');

    const stores = await this.storeModel.find().lean();
    if (stores.length === 0) {
      throw new HttpException('Nenhuma loja encontrada', HttpStatus.NOT_FOUND);
    }

    return this.storeModel.find().lean();
  }
}
