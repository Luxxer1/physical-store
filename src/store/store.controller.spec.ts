import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

const mockStoreService = {
  listAllStores: jest.fn(),
  countAllStores: jest.fn(),
  findStoreWithShippingByCep: jest.fn(),
  findStoreById: jest.fn(),
  findStoresByState: jest.fn(),
};

describe('StoreController', () => {
  let controller: StoreController;

  beforeEach(async () => {
    Object.values(mockStoreService).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useValue: mockStoreService,
        },
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('listAll', () => {
    it('deve retornar uma lista de lojas com o total vindo de countAllStores', async () => {
      const mockStores = [{ storeName: 'Loja 1' }, { storeName: 'Loja 2' }];
      mockStoreService.listAllStores.mockResolvedValue(mockStores);
      mockStoreService.countAllStores.mockResolvedValue(99);

      const query = { limit: 10, offset: 0 };
      const result = await controller.listAll(query);

      expect(result).toEqual({
        status: 'success',
        data: { stores: mockStores },
        limit: 10,
        offset: 0,
        total: 99,
      });
      expect(mockStoreService.listAllStores).toHaveBeenCalledWith(10, 0);
      expect(mockStoreService.countAllStores).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se não houver lojas', async () => {
      mockStoreService.listAllStores.mockImplementation(() => {
        throw new Error('Nenhuma loja cadastrada');
      });
      const query = { limit: 10, offset: 0 };
      await expect(controller.listAll(query)).rejects.toThrow(
        'Nenhuma loja cadastrada',
      );
    });
  });

  describe('storeById', () => {
    it('deve retornar uma loja pelo id', async () => {
      const mockStore = { storeName: 'Loja 1', _id: 'abc123' };
      mockStoreService.findStoreById.mockResolvedValue(mockStore);

      const result = await controller.storeById('abc123');

      expect(result).toEqual({
        status: 'success',
        data: { store: mockStore },
      });
      expect(mockStoreService.findStoreById).toHaveBeenCalledWith('abc123');
      expect(mockStoreService.findStoreById).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se a loja não for encontrada', async () => {
      mockStoreService.findStoreById.mockImplementation(() => {
        throw new Error('Nenhuma loja encontrada para o ID fornecido.');
      });

      await expect(controller.storeById('nao-existe')).rejects.toThrow(
        'Nenhuma loja encontrada para o ID fornecido.',
      );
      expect(mockStoreService.findStoreById).toHaveBeenCalledWith('nao-existe');
    });
  });

  describe('storeByState', () => {
    it('deve retornar uma lista de lojas por estado com o total vindo de countAllStores', async () => {
      const mockStores = [{ storeName: 'Loja 1' }, { storeName: 'Loja 2' }];
      const state = 'PE';
      mockStoreService.findStoresByState.mockResolvedValue(mockStores);
      mockStoreService.countAllStores.mockResolvedValue(42);

      const query = { limit: 10, offset: 0 };
      const result = await controller.storeByState(state, query);

      expect(result).toEqual({
        status: 'success',
        data: { stores: mockStores },
        limit: 10,
        offset: 0,
        total: 42,
      });
      expect(mockStoreService.findStoresByState).toHaveBeenCalledWith(
        state,
        10,
        0,
      );
      expect(mockStoreService.countAllStores).toHaveBeenCalledWith({
        state: { $regex: `^${state}$`, $options: 'i' },
      });
      expect(mockStoreService.findStoresByState).toHaveBeenCalledTimes(1);
      expect(mockStoreService.countAllStores).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se não houver lojas para o estado', async () => {
      mockStoreService.findStoresByState.mockImplementation(() => {
        throw new Error('Nenhuma loja encontrada para o estado informado');
      });
      const state = 'XX';
      const query = { limit: 10, offset: 0 };
      await expect(controller.storeByState(state, query)).rejects.toThrow(
        'Nenhuma loja encontrada para o estado informado',
      );
    });
  });

  describe('storeByCep', () => {
    it('deve retornar uma loja com informações de frete pelo cep', async () => {
      const mockResult = {
        status: 'success',
        data: [{ storeName: 'Loja 1', shippingCost: 10 }],
        pins: [],
        limit: 1,
        offset: 0,
        total: 1,
      };
      const cep = '12345-678';
      mockStoreService.findStoreWithShippingByCep.mockResolvedValue(mockResult);

      const result = await controller.storeByCep(cep);

      expect(result).toEqual(mockResult);
      expect(mockStoreService.findStoreWithShippingByCep).toHaveBeenCalledWith(
        cep,
      );
      expect(mockStoreService.findStoreWithShippingByCep).toHaveBeenCalledTimes(
        1,
      );
    });

    it('deve lançar erro se não encontrar loja pelo cep', async () => {
      mockStoreService.findStoreWithShippingByCep.mockImplementation(() => {
        throw new Error('Nenhuma loja encontrada para o CEP fornecido.');
      });
      const cep = '00000-000';
      await expect(controller.storeByCep(cep)).rejects.toThrow(
        'Nenhuma loja encontrada para o CEP fornecido.',
      );
    });

    it('deve lançar erro se o CEP for inválido', async () => {
      mockStoreService.findStoreWithShippingByCep.mockImplementation(() => {
        throw new Error('CEP inválido. Verifique o formato e tente novamente.');
      });
      const cep = '123';
      await expect(controller.storeByCep(cep)).rejects.toThrow(
        'CEP inválido. Verifique o formato e tente novamente.',
      );
    });
  });
});
