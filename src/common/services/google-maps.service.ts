import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GoogleGeocodeResponse } from '../interfaces/google-geocode.interface';
import { GoogleDirectionsResponse } from '../interfaces/google-directions.interface';
import logger from '../logger/logger';

@Injectable()
export class GoogleMapsService {
  private readonly METERS_IN_KM = 1000;

  constructor(private readonly httpService: HttpService) {}

  async geocode(
    address: string,
    apiKey: string,
  ): Promise<{ lat: number; lng: number }> {
    logger.info(`[GoogleMapsService] geocode - Endereço="${address}"`);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GoogleGeocodeResponse>(url),
      );

      switch (data.status) {
        case 'OK':
          if (!data.results?.length) {
            throw new HttpException(
              '[GoogleMapsService] geocode - Nenhum resultado encontrado.',
              HttpStatus.NOT_FOUND,
            );
          }
          return data.results[0].geometry.location;

        case 'ZERO_RESULTS':
          throw new HttpException(
            '[GoogleMapsService] geocode - Endereço não encontrado.',
            HttpStatus.NOT_FOUND,
          );
        case 'OVER_DAILY_LIMIT':
          throw new HttpException(
            '[GoogleMapsService] geocode - Limite diário excedido, chave inválida ou problemas de cobrança.',
            HttpStatus.PAYMENT_REQUIRED,
          );
        case 'OVER_QUERY_LIMIT':
          throw new HttpException(
            '[GoogleMapsService] geocode - Limite de requisições excedido.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        case 'REQUEST_DENIED':
          throw new HttpException(
            '[GoogleMapsService] geocode - Requisição negada pela API do Google Maps.',
            HttpStatus.UNAUTHORIZED,
          );
        case 'INVALID_REQUEST':
          throw new HttpException(
            '[GoogleMapsService] geocode - Requisição inválida (parâmetros faltando ou incorretos).',
            HttpStatus.BAD_REQUEST,
          );
        case 'UNKNOWN_ERROR':
          throw new HttpException(
            '[GoogleMapsService] geocode - Erro desconhecido no servidor do Google. Tente novamente.',
            HttpStatus.BAD_GATEWAY,
          );
        default:
          throw new HttpException(
            `[GoogleMapsService] geocode - Erro inesperado: ${data.status}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }

      const msgError =
        '[GoogleMapsService] geocode - Erro: ' +
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
  
      switch (data.status) {
        case 'OK':
          if (!data.routes?.length) {
            throw new HttpException(
              '[GoogleMapsService] getDistance - Nenhuma rota encontrada.',
              HttpStatus.NOT_FOUND,
            );
          }
          const distanceInKm =
            data.routes[0].legs[0].distance.value / this.METERS_IN_KM;
          return parseFloat(distanceInKm.toFixed(2));
        case 'NOT_FOUND':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Origem ou destino não encontrados.',
            HttpStatus.NOT_FOUND,
          );
        case 'ZERO_RESULTS':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Nenhuma rota disponível entre os pontos informados.',
            HttpStatus.NOT_FOUND,
          );
        case 'MAX_WAYPOINTS_EXCEEDED':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Número máximo de waypoints excedido.',
            HttpStatus.BAD_REQUEST,
          );
        case 'MAX_ROUTE_LENGTH_EXCEEDED':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Comprimento máximo da rota excedido.',
            HttpStatus.BAD_REQUEST,
          );
        case 'INVALID_REQUEST':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Requisição inválida (parâmetros faltando ou incorretos).',
            HttpStatus.BAD_REQUEST,
          );
        case 'OVER_DAILY_LIMIT':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Limite diário excedido, chave inválida ou problemas de cobrança.',
            HttpStatus.PAYMENT_REQUIRED,
          );
        case 'OVER_QUERY_LIMIT':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Limite de requisições excedido.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        case 'REQUEST_DENIED':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Requisição negada pela API do Google Maps.',
            HttpStatus.UNAUTHORIZED,
          );
        case 'UNKNOWN_ERROR':
          throw new HttpException(
            '[GoogleMapsService] getDistance - Erro desconhecido no servidor do Google. Tente novamente.',
            HttpStatus.BAD_GATEWAY,
          );
        default:
          throw new HttpException(
            `[GoogleMapsService] getDistance - Erro inesperado: ${data.status}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      const msgError =
        '[GoogleMapsService] getDistance - Erro ao calcular distância: ' +
        (err instanceof Error ? err.message : JSON.stringify(err));
      throw new HttpException(msgError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }