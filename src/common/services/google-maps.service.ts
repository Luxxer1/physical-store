import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GoogleGeocodeResponse } from '../interfaces/google-geocode.interface';
import { GoogleDirectionsResponse } from '../interfaces/google-directions.interface';

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
      if (err instanceof HttpException) {
        throw err;
      }

      const msgError =
        'Erro no Geocode do Google Maps' +
        (err instanceof Error ? err.message : JSON.stringify(err));

      throw new HttpException(msgError, HttpStatus.INTERNAL_SERVER_ERROR);
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
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }

      const msgError =
        'Erro ao calcular distância: ' +
        (err instanceof Error ? err.message : JSON.stringify(err));
      throw new HttpException(msgError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
