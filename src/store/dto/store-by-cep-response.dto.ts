import { ApiProperty } from '@nestjs/swagger';

class PositionDto {
  /**
   * Latitude da loja
   * @example -23.55052
   */
  lat: number;

  /**
   * Longitude da loja
   * @example -46.633308
   */
  lng: number;
}

class PinDto {
  @ApiProperty({
    type: PositionDto,
    description: 'Coordenadas para exibir no mapa',
  })
  position: PositionDto;

  /**
   * Título exibido no pin
   * @example 'Loja Exemplo'
   */
  title: string;
}

class ShippingOptionDto {
  /**
   * Prazo de entrega
   * @example '1 dia útil'
   */
  prazo: string;

  /**
   * Valor do frete
   * @example 'R$ 15.00'
   */
  price: string;

  /**
   * Descrição do serviço de frete
   * @example 'Motoboy'
   */
  description: string;
}

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
  value: ShippingOptionDto[];
}

export class StoreByCepResponseDto {
  @ApiProperty({
    type: [StoreCepDto],
    description: 'Dados da(s) loja(s) retornadas',
  })
  stores: StoreCepDto[];

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
