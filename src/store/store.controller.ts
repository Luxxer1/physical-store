import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async listAll() {
    const stores = await this.storeService.listAllStores();

    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }

  @Get('/cep/:cep')
  async storeByCep(@Param('cep') cep: string) {
    const result = await this.storeService.findStoreWithShippingByCep(cep);

    return {
      status: 'success',
      data: result,
    };
  }

  @Get('/id/:id')
  async storeById(@Param('id') id: string) {
    const store = await this.storeService.findStoreById(id);

    return {
      status: 'success',
      data: { store },
    };
  }

  @Get('/state/:state')
  async storeByState(@Param('state') state: string) {
    const stores = await this.storeService.findStoresByState(state);

    return {
      status: 'success',
      length: stores.length,
      data: { stores },
    };
  }
}
