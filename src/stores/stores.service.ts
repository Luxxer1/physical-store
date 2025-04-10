import { Injectable } from '@nestjs/common';
import { ListAllResponseDto } from './dto/list-stores.response.dto';
import { StoreByCepResponseDto } from './dto/store-by-cep.response.dto';
import { StoreByIdResponseDto } from './dto/store-by-id.response.dto';
import { StoreByStateResponseDto } from './dto/store-by-state.response.dto';

@Injectable()
export class StoresService {
  listAll(limit: number, offset: number): Promise<ListAllResponseDto> {
    // TODO: Implementar a lógica de listagem de todas as stores
    return {
      stores: [],
      limit,
      offset,
      total: 0,
    };
  }

  async storeByCep(cep: string): Promise<StoreByCepResponseDto> {
    // TODO: Implementar a lógica para retornar stores e pins a partir do CEP
    return {
      stores: [],
      pins: [],
      limit: 0,
      offset: 0,
      total: 0,
    };
  }

  async storeById(id: string): Promise<StoreByIdResponseDto> {
    // TODO: Implementar a lógica para retornar uma store específica pelo ID
    return {
      store: null,
    };
  }

  async storeByState(
    state: string,
    limit: number,
    offset: number,
  ): Promise<StoreByStateResponseDto> {
    // TODO: Implementar a lógica para retornar stores por estado
    return {
      stores: [],
      limit,
      offset,
      total: 0,
    };
  }
}
