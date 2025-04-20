import { ApiProperty } from '@nestjs/swagger';
import { StoreDto } from './store.dto';

/**
 * Estrutura do campo `data` na resposta de listagem de todas as lojas.
 */
class StoreListDataDto {
  /**
   * Lista de lojas encontradas.
   */
  @ApiProperty({
    type: [StoreDto],
  })
  stores: StoreDto[];
}

/**
 * DTO de resposta para listagem de todas as lojas.
 */
export class ListAllResponseDto {
  /**
   * Status da requisição.
   * @example 'success'
   */
  status: string;

  /**
   * Quantidade de lojas retornadas.
   * @example 1
   */
  length: number;

  /**
   * Dados contendo o array de lojas.
   */
  @ApiProperty({ type: () => StoreListDataDto })
  data: StoreListDataDto;
}
