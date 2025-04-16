import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import logger from 'src/common/logger/logger';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async listAll() {
    logger.info('Buscando todas as lojas...');

    const stores = await this.storeService.listAllStores();

    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }

  @Get('/cep/:cep')
  async storeByCep(@Param('cep') cep: string) {
    logger.info(`Buscando loja e frete para o CEP: ${cep}`);

    const result = await this.storeService.findStoreWithShippingByCep(cep);

    return {
      status: 'success',
      data: result,
    };
  }

  @Get('/id/:id')
  async storeById(@Param('id') id: string) {
    logger.info(`Buscando loja com ID: ${id}`);
    const store = await this.storeService.findStoreById(id);
    return {
      status: 'success',
      data: { store },
    };
  }

  @Get('/state/:state')
  async storeByState(@Param('state') state: string) {
    logger.info(`Buscando lojas no estado: ${state}`);
    const stores = await this.storeService.findStoresByState(state);
    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }
}
