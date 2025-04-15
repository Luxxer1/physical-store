import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './store.model';
import { HttpService } from '@nestjs/axios';
import logger from 'src/common/logger/logger';

@Injectable()
export class StoreService {
  private readonly MAX_DISTANCE_KM = 100;
  private readonly METERS_IN_KM = 1000;

  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly httpService: HttpService,
  ) {}

  async getAllStores() {
    logger.info('Buscando todas as lojas...');

    const stores = await this.storeModel.find().lean();
    if (stores.length === 0) {
      throw new HttpException('Nenhuma loja encontrada', HttpStatus.NOT_FOUND);
    }

    return this.storeModel.find().lean();
  }

  async getNearbyStores(cep: string) {
    if (!process.env.API_KEY) {
      throw new HttpException(
        'API KEY não definida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!this.isValidCep(cep)) {
      throw new HttpException(
        'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cepData = await this.fetchCepData(cep);
    if (cepData.erro) {
      throw new HttpException('CEP não encontrado.', HttpStatus.NOT_FOUND);
    }

    const { lat, lng } = await this.getCoordinatesFromAddress(cepData);
    const origin = `${lat},${lng}`;

    logger.info(`Buscando lojas próximas ao CEP: ${cep}`);
    const nearbyStores = await this.getNearbyStoresWithDistance(origin);

    if (nearbyStores.length === 0) {
      throw new HttpException(
        `Nenhuma loja encontrada próxima ao CEP: ${cep}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const sortedStores = this.sortStores(nearbyStores);
    return this.formatStores(sortedStores);
  }

  private isValidCep(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  private async fetchCepData(cep: string): Promise<any> {
    try {
      const url = `https://viacep.com.br/ws/${cep}/json/`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new HttpException('Erro ao buscar dados do CEP', HttpStatus.INTERNAL_SERVER_ERROR);
    
}
