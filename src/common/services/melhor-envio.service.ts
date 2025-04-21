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
        'MELHOR_ENVIO_TOKEN não definido',
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
      logger.info(
        `[MelhorEnvioService] Chamando API para calcular frete - De: ${fromCep} Para: ${toCep}`,
      );
      const { data } = await firstValueFrom(
        this.httpService.post<MelhorEnvioResponse[]>(url, payload, { headers }),
      );

      if (!Array.isArray(data)) {
        throw new HttpException(
          '[MelhorEnvioService] Resposta inesperada da API do MelhorEnvio.',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const validOptions = data.filter(
        (opt) =>
          opt &&
          typeof opt.name === 'string' &&
          typeof opt.custom_price === 'string' &&
          typeof opt.delivery_time === 'number',
      );

      if (!validOptions.length) {
        throw new HttpException(
          '[MelhorEnvioService] Nenhuma opção de frete válida retornada pela API do MelhorEnvio.',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const transformed: ShippingOption[] = validOptions.map((opt) => ({
        estimatedDelivery: `${opt.delivery_time} dias úteis`,
        price: Number(opt.custom_price),
        description: opt.name,
      }));

      logger.info(
        `[MelhorEnvioService] Resposta recebida - ${data.length} opções de frete retornadas`,
      );

      return { type: 'LOJA', shipping: transformed };
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorWithResponse = err as {
          response?: { status?: number; data?: any };
        };
        if (errorWithResponse.response?.status === 422) {
          throw new HttpException(
            '[MelhorEnvioService] Dados inválidos enviados para a API do MelhorEnvio.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const msgError =
        '[MelhorEnvioService] Erro ao calcular frete: ' +
        (err instanceof Error ? err.message : JSON.stringify(err));

      throw new HttpException(msgError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
