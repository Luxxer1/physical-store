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
  countDocuments: jest.fn(),
};

const mockConfigService = { get: jest.fn().mockReturnValue('fake-key') };
const mockViaCepService = { getCepData: jest.fn() };
const mockGoogleMapsService = { geocode: jest.fn(), getDistance: jest.fn() };
const mockMelhorEnvioService = { calculate: jest.fn() };

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

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('listAllStores', () => {
    it('deve retornar lojas', async () => {
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

    it('deve lançar exceção se não houver lojas', async () => {
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
    it('deve retornar loja por id', async () => {
      const doc = { storeName: 'B' };
      mockStoreModel.findById.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(doc),
        }),
      });
      await expect(service.findStoreById('id')).resolves.toEqual(doc);
    });

    it('deve lançar exceção se não encontrar', async () => {
      mockStoreModel.findById.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      });
      await expect(service.findStoreById('id')).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });

  describe('findStoresByState', () => {
    it('deve retornar lojas por estado', async () => {
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
      await expect(service.findStoresByState('PE', 10, 0)).resolves.toEqual(
        fake,
      );
    });

    it('deve lançar exceção se não houver lojas', async () => {
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
        service.findStoresByState('XX', 10, 0),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('countAllStores', () => {
    it('deve contar todas as lojas', async () => {
      mockStoreModel.countDocuments.mockResolvedValue(5);
      await expect(service.countAllStores()).resolves.toBe(5);
    });
    it('deve contar lojas com filtro', async () => {
      mockStoreModel.countDocuments.mockResolvedValue(2);
      await expect(service.countAllStores({ state: 'PE' })).resolves.toBe(2);
    });
  });

  describe('findStoreWithShippingByCep', () => {
    it('deve lançar erro se o CEP for inválido', async () => {
      mockViaCepService.getCepData.mockRejectedValueOnce(
        new HttpException('CEP inválido', 400),
      );
      await expect(
        service.findStoreWithShippingByCep('invalid'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('deve lançar erro se não houver lojas', async () => {
      mockViaCepService.getCepData.mockResolvedValue({
        cep: '50930070',
        logradouro: 'Rua Teste',
        bairro: 'Centro',
        localidade: 'Recife',
        uf: 'PE',
      });
      mockGoogleMapsService.geocode.mockResolvedValue({});
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
        service.findStoreWithShippingByCep('50930070'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('deve lançar erro se algum serviço externo falhar', async () => {
      mockGoogleMapsService.geocode.mockRejectedValueOnce(
        new HttpException('Erro externo', 500),
      );
      await expect(
        service.findStoreWithShippingByCep('12345678'),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('deve retornar resposta válida', async () => {
      mockViaCepService.getCepData.mockResolvedValue({
        cep: '50930070',
        logradouro: 'Rua Teste',
        bairro: 'Centro',
        localidade: 'Recife',
        uf: 'PE',
      });
      mockGoogleMapsService.geocode.mockResolvedValue({ lat: -8, lng: -34 });
      mockGoogleMapsService.getDistance.mockResolvedValue(10);
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
    });
  });
});
