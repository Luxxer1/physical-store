import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import logger from 'src/common/logger/logger';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async getAllStores() {
    logger.info('Buscando todas as lojas...');

    const stores = await this.storeService.getAllStores();

    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }

  @Get('/nearby/:cep')
  async getNearbyStores(@Param('cep') cep: string) {
    logger.info(`Busca de lojas próximas para o CEP: ${cep}`);
    const stores = await this.storeService.getNearbyStores(cep);
    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }
}
