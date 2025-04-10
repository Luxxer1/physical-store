import { Controller, Get, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import { ListAllResponseDto } from './dto/list-stores.response.dto';
// import { StoreByCepResponseDto } from './dto/store-by-cep.response.dto';
// import { StoreByIdResponseDto } from './dto/store-by-id.response.dto';
// import { StoreByStateResponseDto } from './dto/store-by-state.response.dto';

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
}
