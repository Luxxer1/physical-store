import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './store.model';
import { HttpService } from '@nestjs/axios';
import logger from 'src/common/logger/logger';
import { firstValueFrom } from 'rxjs';
import { ViaCepResponse } from 'src/common/interfaces/viaCep.interface';
import { FormattedStore } from 'src/common/interfaces/formattedStore.interface';
import { GoogleGeocodeResponse } from 'src/common/interfaces/googleGeocode.interface';
import { GoogleDirectionsResponse } from 'src/common/interfaces/googleDirections.interface';

type StoreWithDistance = Store & {
  distance: string;
  numericDistance: number;
};

@Injectable()
export class StoreService {
  private readonly MAX_DISTANCE_KM = 100;
  private readonly METERS_IN_KM = 1000;

  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly httpService: HttpService,
  ) {}

  async getAllStores(): Promise<Store[]> {
    logger.info('Buscando todas as lojas...');
    const stores = await this.storeModel.find().lean().exec();
    if (!stores || stores.length === 0) {
      throw new HttpException('Nenhuma loja encontrada', HttpStatus.NOT_FOUND);
    }
    return stores;
  }

  async getNearbyStores(cep: string): Promise<FormattedStore[]> {
    this.validateApiKey();
    this.validateCepFormat(cep);

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

  private validateApiKey(): void {
    if (!process.env.API_KEY) {
      throw new HttpException(
        'API KEY não definida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateCepFormat(cep: string): void {
    if (!/^\d{8}$/.test(cep)) {
      throw new HttpException(
        'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async fetchCepData(cep: string): Promise<ViaCepResponse> {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<ViaCepResponse>(url),
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Erro ao buscar dados do CEP: ${error.message}`);
      } else {
        logger.error('Erro desconhecido ao buscar dados do CEP');
      }
      throw new HttpException(
        'Erro ao buscar dados do CEP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getCoordinatesFromAddress(
    cepData: ViaCepResponse,
  ): Promise<{ lat: number; lng: number }> {
    const address = encodeURIComponent(
      `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`,
    );
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<GoogleGeocodeResponse>(url),
      );
      const geocodeData = response.data;
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new HttpException(
          'Não foi possível obter as coordenadas do endereço.',
          HttpStatus.NOT_FOUND,
        );
      }
      return geocodeData.results[0].geometry.location;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Erro ao obter coordenadas: ${error.message}`);
      } else {
        logger.error('Erro desconhecido ao obter coordenadas.');
      }
      throw new HttpException(
        'Erro ao obter coordenadas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async calculateDistance(
    origin: string,
    destination: string,
  ): Promise<number> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.API_KEY}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<GoogleDirectionsResponse>(url),
      );
      const data = response.data;
      if (data.status !== 'OK' || !data.routes?.length) {
        throw new HttpException(
          'Não foi possível calcular a distância.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const distanceMeters = data.routes[0].legs[0].distance.value;
      return distanceMeters / this.METERS_IN_KM;
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

  private async getNearbyStoresWithDistance(
    origin: string,
  ): Promise<StoreWithDistance[]> {
    const stores = await this.storeModel.find().lean().exec();
    const nearbyStores: StoreWithDistance[] = [];

    for (const store of stores) {
      if (store.location && Array.isArray(store.location.coordinates)) {
        const [storeLng, storeLat] = store.location.coordinates;
        const destination = `${storeLat},${storeLng}`;
        const distance = await this.calculateDistance(origin, destination);

        if (distance <= this.MAX_DISTANCE_KM) {
          nearbyStores.push({
            ...store,
            distance: `${distance} km`,
            numericDistance: distance,
          });
        }
      }
    }
    return nearbyStores;
  }

  private sortStores(stores: StoreWithDistance[]): StoreWithDistance[] {
    return stores.sort((a, b) => a.numericDistance - b.numericDistance);
  }

  private formatStores(stores: StoreWithDistance[]): FormattedStore[] {
    return stores.map((store) => ({
      storeName: store.storeName,
      zipCode: store.zipCode,
      address: store.address,
      number: store.number,
      neighborhood: store.neighborhood,
      city: store.city,
      state: store.state,
      phoneNumber: store.phoneNumber,
      businessHour: store.businessHour,
      distance: store.distance,
    }));
  }
}
