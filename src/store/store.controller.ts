import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreByCepResponseDto } from './dto/store-by-cep-response.dto';
import { ApiParam, ApiResponse } from '@nestjs/swagger';
import { StoreByStateResponseDto } from './dto/store-by-state-response.dto';
import { StoreByIdResponseDto } from './dto/store-by-id-response.dto';
import { ListAllResponseDto } from './dto/store-list-response.dto';

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
  async listAll(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    const stores = await this.storeService.listAllStores(+limit, +offset);

    return {
      data: { stores },
      limit: limit,
      offset: offset,
      total: stores.length,
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
    example: '67cb6061a9a283add117ff16',
  })
  @ApiResponse({
    description: 'Loja encontrada com sucesso.',
    status: 200,
    type: StoreByIdResponseDto,
  })
  @Get('/id/:id')
  async storeById(@Param('id') id: string) {
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
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    const stores = await this.storeService.findStoresByState(
      state,
      +limit,
      +offset,
    );

    return {
      status: 'success',
      data: { stores },
      limit: +limit,
      offset: +offset,
      total: stores.length,
    };
  }

  /**
   * Buscar loja mais próxima e opções de frete por CEP.
   *
   * @remarks Retorna dados da loja e opções de frete para o CEP fornecido de acordo com a loja mais próxima.
   *
   * @throws {400} CEP inválido.
   * @throws {404} Recurso não encontrado. CEP não encontrado ou não foi possível obter a localização do CEP.
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
  async storeByCep(@Param('cep') cep: string) {
    const result = await this.storeService.findStoreWithShippingByCep(cep);

    return {
      status: 'success',
      data: result,
    };
  }
}
