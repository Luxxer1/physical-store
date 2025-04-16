import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Store, StoreDocument } from './store.model';
import { ViaCepService } from 'src/common/services/via-cep.service';
import { GoogleMapsService } from 'src/common/services/google-maps.service';
import { MelhorEnvioService } from 'src/common/services/melhor-envio.service';
import { FormattedStore } from 'src/common/interfaces/formattedStore.interface';
import { ShippingResult } from 'src/common/interfaces/shipping-result.interface';
import { StoreByCepResponse } from 'src/common/interfaces/store-by-cep-response.interface';
import logger from 'src/common/logger/logger';
import { CepDto } from 'src/common/dtos/cep.dto';
import { validateOrReject } from 'class-validator';

interface Coordinates {
  lat: number;
  lng: number;
}

type StoreWithDistance = Store & {
  distance: string;
  numericDistance: number;
};

@Injectable()
export class StoreService {
  private readonly apiKey: string;

  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly config: ConfigService,
    private readonly viaCep: ViaCepService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly melhorEnvioService: MelhorEnvioService,
  ) {
    const token = this.config.get<string>('GOOGLE_API_KEY');
    if (!token) {
      logger.error('GOOGLE_API_KEY não está definida');
      throw new HttpException(
        'GOOGLE_API_KEY não está definida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.apiKey = token;
  }

  async listAllStores(): Promise<Store[]> {
    logger.info('Buscando todas as lojas');
    const stores = await this.queryStores({});
    if (!stores.length) {
      throw new HttpException('Nenhuma loja encontrada', HttpStatus.NOT_FOUND);
    }
    return stores;
  }

  async findStoreById(id: string): Promise<Store> {
    logger.info(`Buscando loja por ID: ${id}`);
    const store = await this.storeModel.findById(id).lean().exec();
    if (!store) {
      throw new HttpException('Loja não encontrada', HttpStatus.NOT_FOUND);
    }
    return store;
  }

  async findStoresByState(state: string): Promise<Store[]> {
    logger.info(`Buscando lojas por estado: ${state}`);
    const stores = await this.queryStores({
      state: { $regex: `^${state}$`, $options: 'i' },
    });
    if (!stores.length) {
      throw new HttpException(
        'Nenhuma loja encontrada para o estado informado',
        HttpStatus.NOT_FOUND,
      );
    }
    return stores;
  }

  async findStoreWithShippingByCep(cep: string): Promise<StoreByCepResponse> {
    this.ensureValidCep(cep);

    logger.info(`Buscando loja e frete para CEP: ${cep}`);

    const origin = await this.getCoordinatesFromCep(cep);
    const closest = await this.findNearestStore(origin);
    const shipping = await this.getShippingOptions(cep, closest);

    return this.formatCepResponse(closest, shipping);
  }

  private async queryStores(filter: FilterQuery<Store>): Promise<Store[]> {
    return this.storeModel.find(filter).lean().exec();
  }

  private async ensureValidCep(cep: string): Promise<void> {
    const cepDto = new CepDto();
    cepDto.cep = cep;

    try {
      await validateOrReject(cepDto);
    } catch {
      throw new HttpException(
        'CEP inválido. Verifique o formato e tente novamente.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getCoordinatesFromCep(cep: string): Promise<string> {
    const cepData = await this.viaCep.getCepData(cep);
    const coords = await this.geocodeAddress(
      `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`,
    );
    return `${coords.lat},${coords.lng}`;
  }

  private async geocodeAddress(address: string): Promise<Coordinates> {
    return this.googleMapsService.geocode(address, this.apiKey);
  }

  private async calculateDistance(
    origin: string,
    destination: string,
  ): Promise<number> {
    return this.googleMapsService.getDistance(origin, destination, this.apiKey);
  }

  private async calculateStoresDistance(
    origin: string,
  ): Promise<StoreWithDistance[]> {
    const stores = await this.queryStores({});

    const promises = stores.map(async (store) => {
      const [lng, lat] = store.location?.coordinates ?? [];
      if (lat == null || lng == null) return null;
      const km = await this.calculateDistance(origin, `${lat},${lng}`);
      return { ...store, numericDistance: km, distance: `${km.toFixed(2)} km` };
    });

    const results = (await Promise.all(promises)).filter(
      (s): s is StoreWithDistance => s !== null,
    );

    return results;
  }

  private sortByDistance(stores: StoreWithDistance[]): StoreWithDistance[] {
    return stores.sort((a, b) => a.numericDistance - b.numericDistance);
  }

  private mapFormattedStores(stores: StoreWithDistance[]): FormattedStore[] {
    return stores.map((s) => ({
      storeName: s.storeName,
      zipCode: s.zipCode,
      address: s.address,
      number: s.number,
      neighborhood: s.neighborhood,
      city: s.city,
      state: s.state,
      phoneNumber: s.phoneNumber,
      businessHour: s.businessHour,
      distance: s.distance,
    }));
  }

  private async findNearestStore(origin: string): Promise<StoreWithDistance> {
    const list = await this.calculateStoresDistance(origin);
    if (!list.length) {
      throw new HttpException(
        'Nenhuma loja encontrada próxima ao CEP informado',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.sortByDistance(list)[0];
  }

  private formatCepResponse(
    store: StoreWithDistance,
    shipping: ShippingResult,
  ): StoreByCepResponse {
    return {
      stores: [
        {
          name: store.storeName,
          city: store.city,
          postalCode: store.zipCode,
          type: shipping.type,
          distance: store.distance,
          value: shipping.value,
        },
      ],
      pins: [
        {
          position: {
            lat: store.location.coordinates[1],
            lng: store.location.coordinates[0],
          },
          title: store.storeName,
        },
      ],
      limit: 1,
      offset: 0,
      total: 1,
    };
  }

  private async getShippingOptions(
    toCep: string,
    store: StoreWithDistance,
  ): Promise<ShippingResult> {
    if (store.numericDistance <= 50) {
      return {
        type: 'PDV',
        value: [
          { prazo: '1 dia útil', price: 'R$ 15.00', description: 'Motoboy' },
        ],
      };
    }
    return this.melhorEnvioService.calculate(store.zipCode, toCep);
  }
}
