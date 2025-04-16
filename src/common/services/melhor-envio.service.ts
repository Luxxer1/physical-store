import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MelhorEnvioResponse } from '../interfaces/melhor-envio-response.interface';
import {
  ShippingResult,
  ShippingOption,
} from '../interfaces/shipping-result.interface';
import logger from '../logger/logger';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MelhorEnvioService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async calculate(fromCep: string, toCep: string): Promise<ShippingResult> {
    const token = this.configService.get<string>('MELHOR_ENVIO_TOKEN');
    if (!token) {
      throw new HttpException(
        'Token do Melhor Envio não definido',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const url = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';
    const payload = {
      from: { postal_code: fromCep },
      to: { postal_code: toCep },
      package: { height: 4, width: 12, length: 17, weight: 0.3 },
      services: '1,2',
    };
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'PhysycalStore',
    };

    try {
      logger.info('Chamando a API do Melhor Envio...');
      const { data } = await firstValueFrom(
        this.httpService.post<MelhorEnvioResponse[]>(url, payload, { headers }),
      );
      const transformed: ShippingOption[] = Array.isArray(data)
        ? data.map((opt) => ({
            prazo: `${opt.delivery_time} dias úteis`,
            price: `R$ ${parseFloat(opt.custom_price).toFixed(2)}`,
            description: opt.name,
          }))
        : [];

      logger.info('Resposta recebida do Melhor Envio!');

      return { type: 'LOJA', value: transformed };
    } catch (err: unknown) {
      logger.error('Erro na integração com Melhor Envio', err);
      throw new HttpException(
        'Erro ao calcular frete.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
