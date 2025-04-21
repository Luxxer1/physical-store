import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StoreService } from './store.service';
import { ConfigService } from '@nestjs/config';
import { ViaCepService } from 'src/common/services/via-cep.service';
import { GoogleMapsService } from 'src/common/services/google-maps.service';
import { MelhorEnvioService } from 'src/common/services/melhor-envio.service';
import { HttpException } from '@nestjs/common';

const mockStoreModel = {
  find: jest.fn(),
  findById: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('fake-google-api-key'),
};

const mockViaCepService = {
  getCepData: jest.fn().mockResolvedValue({
    logradouro: 'Rua Teste',
    bairro: 'Centro',
    localidade: 'Recife',
    uf: 'PE',
  }),
};

const mockGoogleMapsService = {
  geocode: jest.fn().mockResolvedValue({ lat: -8.0, lng: -34.9 }),
  getDistance: jest.fn().mockResolvedValue(10),
};

const mockMelhorEnvioService = {
  calculate: jest.fn().mockResolvedValue({
    type: 'LOJA',
    shipping: [
      {
        estimatedDelivery: '3 dias úteis',
        price: 25.0,
        description: 'PAC',
      },
    ],
  }),
};

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getModelToken('Store'), useValue: mockStoreModel },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ViaCepService, useValue: mockViaCepService },
        { provide: GoogleMapsService, useValue: mockGoogleMapsService },
        { provide: MelhorEnvioService, useValue: mockMelhorEnvioService },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listAllStores', () => {
    it('should return stores when found', async () => {
      const fakeStores = [{ storeName: 'A' }];
      mockStoreModel.find.mockReturnValue({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve(fakeStores),
            }),
          }),
        }),
      });
      await expect(service.listAllStores()).resolves.toEqual(fakeStores);
    });

    it('should throw if none found', async () => {
      mockStoreModel.find.mockReturnValue({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve([]),
            }),
          }),
        }),
      });
      await expect(service.listAllStores()).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });

  describe('findStoreById', () => {
    it('should return store when found', async () => {
      const doc = { storeName: 'B' };
      mockStoreModel.findById.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(doc),
        }),
      });
      await expect(service.findStoreById('anyId')).resolves.toEqual(doc);
    });

    it('should throw if not found', async () => {
      mockStoreModel.findById.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      });
      await expect(service.findStoreById('anyId')).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });

  describe('findStoresByState', () => {
    it('should return stores when found', async () => {
      const fake = [{ state: 'PE' }];
      mockStoreModel.find.mockReturnValue({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve(fake),
            }),
          }),
        }),
      });
      await expect(service.findStoresByState('pe', 10, 0)).resolves.toEqual(
        fake,
      );
    });

    it('should throw if none found', async () => {
      mockStoreModel.find.mockReturnValue({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () => Promise.resolve([]),
            }),
          }),
        }),
      });
      await expect(
        service.findStoresByState('xx', 10, 0),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('findStoreWithShippingByCep', () => {
    it('should throw on invalid CEP', async () => {
      mockViaCepService.getCepData.mockRejectedValueOnce(
        new HttpException('CEP inválido', 400),
      );
      await expect(
        service.findStoreWithShippingByCep('invalid'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('should throw if GoogleMapsService throws', async () => {
      mockGoogleMapsService.geocode.mockRejectedValueOnce(
        new HttpException('Endereço não encontrado', 404),
      );
      await expect(
        service.findStoreWithShippingByCep('12345678'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('should throw if MelhorEnvioService throws', async () => {
      mockMelhorEnvioService.calculate.mockRejectedValueOnce(
        new HttpException('Erro no MelhorEnvio', 500),
      );
      mockStoreModel.find.mockReturnValue({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () =>
                Promise.resolve([
                  {
                    storeName: 'L1',
                    zipCode: '12345-678',
                    location: { coordinates: [-34.9, -8.0] },
                    city: 'Recife',
                    state: 'PE',
                    address: 'Rua Teste',
                    number: '100',
                    neighborhood: 'Centro',
                    phoneNumber: '1234-5678',
                    businessHour: '9-18h',
                  },
                ]),
            }),
          }),
        }),
      });
      await expect(
        service.findStoreWithShippingByCep('12345678'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('should return a valid response', async () => {
      mockStoreModel.find.mockReturnValue({
        skip: () => ({
          limit: () => ({
            lean: () => ({
              exec: () =>
                Promise.resolve([
                  {
                    storeName: 'L1',
                    zipCode: '12345-678',
                    location: { coordinates: [-34.9, -8.0] },
                    city: 'Recife',
                    state: 'PE',
                    address: 'Rua Teste',
                    number: '100',
                    neighborhood: 'Centro',
                    phoneNumber: '1234-5678',
                    businessHour: '9-18h',
                  },
                ]),
            }),
          }),
        }),
      });

      const res = await service.findStoreWithShippingByCep('12345678');
      expect(res.status).toBe('success');
      expect(res.data[0]).toHaveProperty('name', 'L1');
      expect(res.pins[0]).toHaveProperty('title', 'L1');
      expect(res.limit).toBe(1);
      expect(res.offset).toBe(0);
      expect(res.total).toBe(1);
    });
  });
});
