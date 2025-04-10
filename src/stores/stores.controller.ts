import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import { ListAllResponseDto } from './dto/list-stores.response.dto';
import { StoreByCepResponseDto } from './dto/store-by-cep.response.dto';
import { StoreByIdResponseDto } from './dto/store-by-id.response.dto';
import { StoreByStateResponseDto } from './dto/store-by-state.response.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async listAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<ListAllResponseDto> {
    return this.storesService.listAll(limit, offset);
  }

  @Get('/cep/:cep')
  async storeByCep(@Param('cep') cep: string): Promise<StoreByCepResponseDto> {
    return this.storesService.storeByCep(cep);
  }

  @Get('/id/:id')
  async storeById(@Param('id') id: string): Promise<StoreByIdResponseDto> {
    return this.storesService.storeById(id);
  }

  @Get('/state/:state')
  async storeByState(
    @Param('state') state: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<StoreByStateResponseDto> {
    return this.storesService.storeByState(state, limit, offset);
  }
}
