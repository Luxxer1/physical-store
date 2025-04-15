import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import logger from 'src/common/logger/logger';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async listAll() {
    logger.info('Buscando todas as lojas...');

    const stores = await this.storeService.getAllStores();

    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }

  @Get('/id/:id')
  async storeById(@Param('id') id: string) {
    logger.info(`Buscando loja com ID: ${id}`);
    const store = await this.storeService.getStoreById(id);
    return {
      status: 'success',
      data: { store },
    };
  }

  @Get('/state/:state')
  async storeByState(@Param('state') state: string) {
    logger.info(`Buscando lojas no estado: ${state}`);
    const stores = await this.storeService.getStoresByState(state);
    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }

  // @Get('/cep/:cep')
  // async storeByCep(@Param('cep') cep: string) {
  //   logger.info(`Busca de lojas para o CEP: ${cep}`);
  //   // Esse método retorna um objeto contendo:
  //   // - stores: array com as lojas com tipos PDV ou LOJA e seus valores
  //   // - pins: array com os pins para o maps
  //   // - dados de paginação (limit, offset, total)
  //   const response = await this.storeService.getStoresByCep(cep);
  //   return response;
  // }
}
