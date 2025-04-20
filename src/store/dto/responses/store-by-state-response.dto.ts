import { ApiProperty } from '@nestjs/swagger';
import { StoreDto } from '../shared/store.dto';

class StoreByStateDataDto {
  /** Lista de lojas localizadas */
  @ApiProperty({ type: [StoreDto] })
  stores: StoreDto[];
}

/**
 * DTO de resposta para consulta de lojas por estado.
 */
export class StoreByStateResponseDto {
  /**
   * Status da requisição.
   * @example 'success'
   */
  status: string;

  /** Dados retornados contendo as lojas */
  @ApiProperty({ type: () => StoreByStateDataDto })
  data: StoreByStateDataDto;

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
