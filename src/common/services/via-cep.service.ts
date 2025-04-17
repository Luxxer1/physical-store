import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ViaCepResponse } from '../interfaces/viaCep.interface';

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
        throw new HttpException('CEP não encontrado.', HttpStatus.NOT_FOUND);
      }
      return data;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }

      const errMsg =
        'Erro ao buscar dados do CEP: ' +
        (err instanceof Error ? err.message : JSON.stringify(err));

      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
