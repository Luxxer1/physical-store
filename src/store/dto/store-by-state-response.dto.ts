import { ApiProperty } from '@nestjs/swagger';
import { StoreDto } from './store.dto';

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

  /**
   * Quantidade de lojas encontradas
   * @example 1
   */
  length: number;

  /** Dados retornados contendo as lojas */
  @ApiProperty({ type: () => StoreByStateDataDto })
  data: StoreByStateDataDto;
}
