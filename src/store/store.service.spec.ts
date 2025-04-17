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
    type: 'PDV',
    value: [{ prazo: '1 dia útil', price: 'R$ 15.00', description: 'Motoboy' }],
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('listAllStores: should return stores when found', async () => {
    const fakeStores = [{ storeName: 'A' }];
    mockStoreModel.find.mockReturnValue({
      lean: () => ({ exec: () => fakeStores }),
    });
    await expect(service.listAllStores()).resolves.toEqual(fakeStores);
  });

  it('listAllStores: should throw if none found', async () => {
    mockStoreModel.find.mockReturnValue({
      lean: () => ({ exec: () => [] }),
    });
    await expect(service.listAllStores()).rejects.toBeInstanceOf(HttpException);
  });

  it('findStoreById: should return store when found', async () => {
    const doc = { storeName: 'B' };
    mockStoreModel.findById.mockReturnValue({
      lean: () => ({ exec: () => doc }),
    });
    await expect(service.findStoreById('anyId')).resolves.toEqual(doc);
  });

  it('findStoreById: should throw if not found', async () => {
    mockStoreModel.findById.mockReturnValue({
      lean: () => ({ exec: () => null }),
    });
    await expect(service.findStoreById('anyId')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('findStoresByState: should return stores when found', async () => {
    const fake = [{ state: 'PE' }];
    mockStoreModel.find.mockReturnValue({
      lean: () => ({ exec: () => fake }),
    });
    await expect(service.findStoresByState('pe')).resolves.toEqual(fake);
  });

  it('findStoresByState: should throw if none found', async () => {
    mockStoreModel.find.mockReturnValue({
      lean: () => ({ exec: () => [] }),
    });
    await expect(service.findStoresByState('xx')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('findStoreWithShippingByCep: should throw on invalid CEP', async () => {
    await expect(
      service.findStoreWithShippingByCep('invalid'),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('findStoreWithShippingByCep: should return a valid response', async () => {
    mockStoreModel.find.mockReturnValue({
      lean: () => ({
        exec: () => [
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
        ],
      }),
    });

    const res = await service.findStoreWithShippingByCep('12345678');
    expect(res.stores[0]).toHaveProperty('name', 'L1');
    expect(res.pins[0]).toHaveProperty('title', 'L1');
  });
});
