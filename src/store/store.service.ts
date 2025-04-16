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
import { MelhorEnvioResponse } from 'src/common/interfaces/melhor-envio-response.interface';
import { ShippingResult } from 'src/common/interfaces/shipping-result.interface';
import { StoreByCepResponse } from 'src/common/interfaces/store-by-cep-response.interface';
import { ViaCepService } from 'src/common/services/via-cep.service';

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
    private viaCep: ViaCepService,
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
    return await this.viaCep.getCepData(cep);
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
      if (!process.env.MELHOR_ENVIO_TOKEN) {
        throw new HttpException(
          'Token do Melhor Envio não definido',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';
      const payload = {
        from: { postal_code: closestStore.zipCode },
        to: { postal_code: userCep },
        package: {
          height: 4,
          width: 12,
          length: 17,
          weight: 0.3,
        },
        services: '1,2',
      };

      try {
        const headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          'User-Agent': 'PhysycalStore lucas.figueiredo.pb@compasso.com.br',
        };
        const { data: apiOptions } = await firstValueFrom(
          this.httpService.post<MelhorEnvioResponse>(url, payload, { headers }),
        );

        logger.info('Chamando a API do Melhor Envio...');
        logger.info(JSON.stringify(apiOptions, null, 2));
        logger.info('Resposta recebida do Melhor Envio!');

        const transformedOptions = Array.isArray(apiOptions)
          ? apiOptions.map((opt: MelhorEnvioResponse) => ({
              prazo: `${opt.delivery_time} dias úteis`,
              price: `R$ ${parseFloat(opt.custom_price).toFixed(2)}`,
              description: opt.name,
            }))
          : [];

        return {
          type: 'LOJA',
          value: transformedOptions,
        };
      } catch (error: unknown) {
        if (error instanceof Error) {
          logger.error(`Erro na integração com Melhor Envio: ${error.message}`);
        }
        throw new HttpException(
          'Erro ao calcular frete com a API do Melhor Envio',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
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
