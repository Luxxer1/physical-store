import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './location.dto';

export class PinDto {
  @ApiProperty({
    type: LocationDto,
    description: 'Coordenadas para exibir no mapa',
  })
  position: LocationDto;

  /**
   * Título exibido no pin
   * @example 'Loja Exemplo'
   */
  title: string;
}
