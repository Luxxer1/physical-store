import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreByCepResponseDto } from './dto/responses/store-by-cep-response.dto';
import { ApiParam, ApiResponse } from '@nestjs/swagger';
import { StoreByStateResponseDto } from './dto/responses/store-by-state-response.dto';
import { StoreByIdResponseDto } from './dto/responses/store-by-id-response.dto';
import { ListAllResponseDto } from './dto/responses/list-all-response.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  /**
   * Mostrar todas as lojas cadastradas.
   *
   * @remarks Essa operação retorna uma lista com todas as lojas cadastradas.
   *
   * @throws {404} Nenhuma loja cadastrada.
   */
  @ApiResponse({
    description: 'Todas as lojas encontradas com sucesso.',
    status: 200,
    type: ListAllResponseDto,
  })
  @Get()
  async listAll(
    @Query() query: PaginationQueryDto,
  ): Promise<ListAllResponseDto> {
    const { limit = 10, offset = 0 } = query;
    const [stores, total] = await Promise.all([
      this.storeService.listAllStores(limit, offset),
      this.storeService.countAllStores(),
    ]);

    return {
      status: 'success',
      data: { stores },
      limit,
      offset,
      total,
    };
  }

  /**
   * Mostrar loja por id.
   *
   * @remarks Essa operação retorna a loja correspondente ao ID.
   *
   * @throws {404} Nenhuma loja encontrada para o ID fornecido.
   */
  @ApiParam({
    name: 'id',
    description: 'ID para busca',
    example: '1',
  })
  @ApiResponse({
    description: 'Loja encontrada com sucesso.',
    status: 200,
    type: StoreByIdResponseDto,
  })
  @Get('/id/:id')
  async storeById(@Param('id') id: string): Promise<StoreByIdResponseDto> {
    const store = await this.storeService.findStoreById(id);

    return {
      status: 'success',
      data: { store },
    };
  }

  /**
   * Mostrar loja por Estado.
   *
   * @remarks Essa operação retorna lojas cadastradas no estado fornecido.
   *
   * @throws {404} Nenhuma loja cadastrada para o estado fornecido.
   */
  @ApiParam({
    name: 'state',
    description: 'Estado para busca',
    example: 'Pernambuco',
  })
  @ApiResponse({
    description: 'Lojas encontradas com sucesso.',
    status: 200,
    type: StoreByStateResponseDto,
  })
  @Get('/state/:state')
  async storeByState(
    @Param('state') state: string,
    @Query() query: PaginationQueryDto,
  ): Promise<StoreByStateResponseDto> {
    const { limit = 10, offset = 0 } = query;
    const filter = { state: { $regex: `^${state}$`, $options: 'i' } };
    const [stores, total] = await Promise.all([
      this.storeService.findStoresByState(state, limit, offset),
      this.storeService.countAllStores(filter),
    ]);

    return {
      status: 'success',
      data: { stores },
      limit,
      offset,
      total,
    };
  }

  /**
   * Buscar loja mais próxima e opções de frete por CEP.
   *
   * @remarks Retorna dados da loja e opções de frete para o CEP fornecido de acordo com a loja mais próxima.
   *
   * @throws {400} CEP inválido.
   * @throws {404} Recurso não encontrado: CEP inexistente, sem lojas próximas, localização do CEP indisponível ou rota não encontrada.
   * @throws {500} Erro interno do servidor.
   */
  @ApiParam({
    name: 'cep',
    description: 'CEP para consulta',
    example: '01001000',
  })
  @ApiResponse({
    description: 'Retorna dados da loja e opções de frete.',
    status: 200,
    type: StoreByCepResponseDto,
  })
  @Get('/cep/:cep')
  async storeByCep(@Param('cep') cep: string): Promise<StoreByCepResponseDto> {
    const result = await this.storeService.findStoreWithShippingByCep(cep);

    return {
      status: 'success',
      data: result.data,
      pins: result.pins,
      limit: result.limit,
      offset: result.offset,
      total: result.total,
    };
  }
}
