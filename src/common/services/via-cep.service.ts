import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ViaCepResponse } from '../interfaces/via-cep.interface';
import { getAxiosStatus } from '../utils/get-axios-status.utils';

@Injectable()
export class ViaCepService {
  constructor(private readonly httpService: HttpService) {}

  async getCepData(cep: string): Promise<ViaCepResponse> {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<ViaCepResponse>(url),
      );
      const data = response.data;
      if (data.erro) {
        throw new HttpException(
          '[ViaCepService] CEP não encontrado.',
          HttpStatus.NOT_FOUND,
        );
      }
      return data;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }

      const status = getAxiosStatus(err);
      switch (status) {
        case 400:
          throw new HttpException(
            '[ViaCepService] Requisição inválida para o ViaCEP.',
            HttpStatus.BAD_REQUEST,
          );
        case 404:
          throw new HttpException(
            '[ViaCepService] Endpoint ViaCEP não encontrado.',
            HttpStatus.NOT_FOUND,
          );
        case 429:
          throw new HttpException(
            '[ViaCepService] Limite de requisições do ViaCEP excedido.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
      }

      const errMsg =
        '[ViaCepService] Erro ao buscar dados do CEP: ' +
        (err instanceof Error ? err.message : JSON.stringify(err));

      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
