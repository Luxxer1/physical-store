import { ApiProperty } from '@nestjs/swagger';
import { StoreDto } from '../shared/store.dto';

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
   * Dados contendo o array de lojas.
   */
  @ApiProperty({ type: () => StoreListDataDto })
  data: StoreListDataDto;

  /**
   * Número máximo de lojas retornadas na resposta.
   * @example 1
   */
  limit: number;

  /**
   * Número de lojas ignoradas (usado para paginação).
   * @example 1
   */
  offset: number;

  /**
   * Número total de lojas disponíveis para a consulta (independente da paginação).
   * @example 1
   */
  total: number;
}
