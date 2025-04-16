import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GoogleGeocodeResponse } from '../interfaces/googleGeocode.interface';
import { GoogleDirectionsResponse } from '../interfaces/googleDirections.interface';
import logger from '../logger/logger';

@Injectable()
export class GoogleMapsService {
  private readonly METERS_IN_KM = 1000;

  constructor(private readonly httpService: HttpService) {}

  async geocode(
    address: string,
    apiKey: string,
  ): Promise<{ lat: number; lng: number }> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GoogleGeocodeResponse>(url),
      );
      if (!data.results?.length) {
        throw new HttpException(
          'Não foi possível obter coordenadas.',
          HttpStatus.NOT_FOUND,
        );
      }
      return data.results[0].geometry.location;
    } catch (err: unknown) {
      logger.error('Erro no Geocode do Google Maps', err);
      throw new HttpException(
        'Erro ao obter coordenadas.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDistance(
    origin: string,
    destination: string,
    apiKey: string,
  ): Promise<number> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GoogleDirectionsResponse>(url),
      );
      if (data.status !== 'OK' || !data.routes?.length) {
        throw new HttpException(
          'Não foi possível calcular a distância.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const distanceInKm =
        data.routes[0].legs[0].distance.value / this.METERS_IN_KM;

      return parseFloat(distanceInKm.toFixed(2));
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Erro ao calcular distância: ${error.message}`);
      } else {
        logger.error('Erro desconhecido ao calcular distância.');
      }
      throw new HttpException(
        'Erro ao calcular a distância.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
