import { Injectable } from '@nestjs/common';
import logger from 'src/common/logger/logger';

@Injectable()
export class StoreService {
  private readonly MAX_DISTANCE_KM = 100;
  private readonly METERS_IN_KM = 1000;

  async getAllStores() {
    logger.info('Buscando todas as lojas...');

    const stores = await this.storeModel.find().lean();

    return this.storeModel.find().lean();
  }
}
