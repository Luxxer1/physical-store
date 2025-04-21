import { ApiProperty } from '@nestjs/swagger';
import { StoreDto } from '../shared/store.dto';

class StoreByIdDataDto {
  /** Loja retornada na busca */
  @ApiProperty({ type: () => StoreDto })
  store: StoreDto;
}

/**
 * DTO de resposta para consulta de loja por ID
 */
export class StoreByIdResponseDto {
  /**
   * Status da requisição
   * @example 'success'
   */
  status: string;

  /** Dados retornados contendo a loja */
  @ApiProperty({ type: () => StoreByIdDataDto })
  data: StoreByIdDataDto;
}
