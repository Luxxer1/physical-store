import { ApiProperty } from '@nestjs/swagger';
import { ShippingOptionDto } from '../shared/shipping-option.dto';
import { PinDto } from '../shared/pin.dto';

class StoreCepDto {
  /**
   * Nome da loja
   * @example 'Loja A'
   */
  name: string;

  /**
   * Cidade da loja
   * @example 'São Paulo'
   */
  city: string;

  /**
   * CEP da loja
   * @example '01001000'
   */
  postalCode: string;

  /**
   * Tipo de frete calculado (LOJA ou PDV)
   * @example 'PDV'
   */
  type: string;

  /**
   * Distância calculada entre CEPs
   * @example '5.23 km'
   */
  distance: string;

  @ApiProperty({
    type: [ShippingOptionDto],
    description: 'Opções de frete disponíveis',
  })
  shipping: ShippingOptionDto[];
}

export class StoreByCepResponseDto {
  /**
   * Status da requisição.
   * @example 'success'
   */
  status: string;

  @ApiProperty({
    type: [StoreCepDto],
    description: 'Dados da(s) loja(s) retornadas',
  })
  data: StoreCepDto[];

  @ApiProperty({ type: [PinDto], description: 'Pins para exibição no mapa' })
  pins: PinDto[];

  /**
   * Limite de resultados
   * @example '1'
   */
  limit: number;

  /**
   * Offset de resultados
   * @example '0'
   */
  offset: number;

  /**
   * Total de resultados encontrados
   * @example '1'
   */
  total: number;
}
