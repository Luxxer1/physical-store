import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  /**
   * Tipo de geometria GeoJSON.
   * @example 'Point'
   */
  type: string;

  /**
   * Coordenadas da loja [longitude, latitude]
   */
  @ApiProperty({ type: [Number], example: [-34.887844, -8.058724] })
  coordinates: [number, number];
}
