import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

// Mock do StoreService
const mockStoreService = {
  listAllStores: jest.fn(),
  findStoreWithShippingByCep: jest.fn(),
  findStoreById: jest.fn(),
  findStoresByState: jest.fn(),
};

describe('StoreController', () => {
  let controller: StoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useValue: mockStoreService, // Usando o mock
        },
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listAll', () => {
    it('should return a list of stores', async () => {
      const mockStores = [{ storeName: 'Store 1' }, { storeName: 'Store 2' }];
      mockStoreService.listAllStores.mockResolvedValue(mockStores);

      const result = await controller.listAll();

      expect(result).toEqual({
        status: 'success',
        length: mockStores.length,
        data: { stores: mockStores },
      });
      expect(mockStoreService.listAllStores).toHaveBeenCalledTimes(1);
    });
  });

  describe('storeByCep', () => {
    it('should return a store with shipping info by cep', async () => {
      const mockResult = { storeName: 'Store 1', shippingCost: 10 };
      const cep = '12345-678';
      mockStoreService.findStoreWithShippingByCep.mockResolvedValue(mockResult);

      const result = await controller.storeByCep(cep);

      expect(result).toEqual({
        status: 'success',
        data: mockResult,
      });
      expect(mockStoreService.findStoreWithShippingByCep).toHaveBeenCalledWith(
        cep,
      );
      expect(mockStoreService.findStoreWithShippingByCep).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('storeById', () => {
    it('should return a store by id', async () => {
      const mockStore = { storeName: 'Store 1', id: '1' };
      const id = '1';
      mockStoreService.findStoreById.mockResolvedValue(mockStore);

      const result = await controller.storeById(id);

      expect(result).toEqual({
        status: 'success',
        data: { store: mockStore },
      });
      expect(mockStoreService.findStoreById).toHaveBeenCalledWith(id);
      expect(mockStoreService.findStoreById).toHaveBeenCalledTimes(1);
    });
  });

  describe('storeByState', () => {
    it('should return a list of stores by state', async () => {
      const mockStores = [{ storeName: 'Store 1' }, { storeName: 'Store 2' }];
      const state = 'PE';
      mockStoreService.findStoresByState.mockResolvedValue(mockStores);

      const result = await controller.storeByState(state);

      expect(result).toEqual({
        status: 'success',
        length: mockStores.length,
        data: { stores: mockStores },
      });
      expect(mockStoreService.findStoresByState).toHaveBeenCalledWith(state);
      expect(mockStoreService.findStoresByState).toHaveBeenCalledTimes(1);
    });
  });
});
