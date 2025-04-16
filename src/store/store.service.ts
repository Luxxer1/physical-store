import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './store.model';
import { HttpService } from '@nestjs/axios';
import logger from 'src/common/logger/logger';
import { ViaCepResponse } from 'src/common/interfaces/viaCep.interface';
import { FormattedStore } from 'src/common/interfaces/formattedStore.interface';
import { ShippingResult } from 'src/common/interfaces/shipping-result.interface';
import { StoreByCepResponse } from 'src/common/interfaces/store-by-cep-response.interface';
import { ViaCepService } from 'src/common/services/via-cep.service';
import { GoogleMapsService } from 'src/common/services/google-maps.service';
import { MelhorEnvioService } from 'src/common/services/melhor-envio.service';

type StoreWithDistance = Store & {
  distance: string;
  numericDistance: number;
};

@Injectable()
export class StoreService {
  private readonly MAX_DISTANCE_KM = 100;

  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly httpService: HttpService,
    private viaCep: ViaCepService,
    private googleMapsService: GoogleMapsService,
    private melhorEnvioService: MelhorEnvioService,
  ) {}

  async getAllStores(): Promise<Store[]> {
    logger.info('Buscando todas as lojas...');
    const stores = await this.storeModel.find().lean().exec();
    if (!stores || stores.length === 0) {
      throw new HttpException('Nenhuma loja encontrada', HttpStatus.NOT_FOUND);
    }
    return stores;
  }

  async getStoreById(id: string): Promise<Store> {
    const store = await this.storeModel.findById(id).lean().exec();
    if (!store) {
      throw new HttpException('Loja não encontrada', HttpStatus.NOT_FOUND);
    }
    return store;
  }

  async getStoresByState(state: string): Promise<Store[]> {
    const capitalizedState = this.toCapitalize(state);

    const stores = await this.storeModel
      .find({ state: capitalizedState })
      .lean()
      .exec();
    if (!stores || stores.length === 0) {
      throw new HttpException(
        'Nenhuma loja encontrada para o estado informado',
        HttpStatus.NOT_FOUND,
      );
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

  private validateApiKey(): string {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new HttpException(
        'API KEY não definida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return apiKey;
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
    return await this.viaCep.getCepData(cep);
  }

  private async getCoordinatesFromAddress(
    cepData: ViaCepResponse,
  ): Promise<{ lat: number; lng: number }> {
    const apiKey = this.validateApiKey();

    const address = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`;

    return this.googleMapsService.geocode(address, apiKey);

    // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY}`;
    // try {
    //   const response = await firstValueFrom(
    //     this.httpService.get<GoogleGeocodeResponse>(url),
    //   );
    //   const geocodeData = response.data;
    //   if (!geocodeData.results || geocodeData.results.length === 0) {
    //     throw new HttpException(
    //       'Não foi possível obter as coordenadas do endereço.',
    //       HttpStatus.NOT_FOUND,
    //     );
    //   }
    //   return geocodeData.results[0].geometry.location;
    // } catch (error: unknown) {
    //   if (error instanceof Error) {
    //     logger.error(`Erro ao obter coordenadas: ${error.message}`);
    //   } else {
    //     logger.error('Erro desconhecido ao obter coordenadas.');
    //   }
    //   throw new HttpException(
    //     'Erro ao obter coordenadas',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  private async calculateDistance(
    origin: string,
    destination: string,
  ): Promise<number> {
    const apiKey = this.validateApiKey();

    return this.googleMapsService.getDistance(origin, destination, apiKey);
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

        nearbyStores.push({
          ...store,
          distance: `${distance} km`,
          numericDistance: distance,
        });
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

  private toCapitalize(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private async calculateShippingOptions(
    userCep: string,
    closestStore: StoreWithDistance,
  ): Promise<ShippingResult> {
    if (closestStore.numericDistance <= 50) {
      return {
        type: 'PDV',
        value: [
          {
            prazo: '1 dias úteis',
            price: 'R$ 15,00',
            description: 'Motoboy',
          },
        ],
      };
    } else {
      // if (!token) {
      //   throw new HttpException(
      //     'Token do Melhor Envio não definido',
      //     HttpStatus.INTERNAL_SERVER_ERROR,
      //   );
      // }

      return this.melhorEnvioService.calculate(closestStore.zipCode, userCep);
    }
  }

  async getStoreByCep(cep: string): Promise<StoreByCepResponse> {
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
    const closestStore = sortedStores[0];

    const shipping = await this.calculateShippingOptions(cep, closestStore);

    const storeResponse = {
      name: closestStore.storeName,
      city: closestStore.city,
      postalCode: closestStore.zipCode,
      type: shipping.type,
      distance: closestStore.distance,
      value: shipping.value,
    };

    const pin = {
      position: {
        lat: closestStore.location?.coordinates?.[1],
        lng: closestStore.location?.coordinates?.[0],
      },
      title: closestStore.storeName,
    };

    return {
      stores: [storeResponse],
      pins: [pin],
      limit: 1,
      offset: 0,
      total: 1,
    };
  }
}
