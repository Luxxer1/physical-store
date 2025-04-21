import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ListAllResponseDto } from 'src/store/dto/responses/list-all-response.dto';
import { StoreByStateResponseDto } from 'src/store/dto/responses/store-by-state-response.dto';
import { StoreByCepResponseDto } from 'src/store/dto/responses/store-by-cep-response.dto';
import { getModelToken } from '@nestjs/mongoose';
import { GoogleMapsService } from '../src/common/services/google-maps.service';
import { ViaCepService } from '../src/common/services/via-cep.service';
import { MelhorEnvioService } from '../src/common/services/melhor-envio.service';

// Mocks
const mockViaCepService = {
  getAddressByCep: jest.fn().mockResolvedValue({
    cep: '50930070',
    logradouro: 'Rua José Catuíte de Almeida',
    bairro: 'Tejipió',
    localidade: 'Recife',
    uf: 'PE',
  }),
  getCepData: jest.fn().mockResolvedValue({
    cep: '50930070',
    logradouro: 'Rua José Catuíte de Almeida',
    bairro: 'Tejipió',
    localidade: 'Recife',
    uf: 'PE',
  }),
};

const mockGoogleMapsService = {
  geocode: jest.fn().mockResolvedValue({
    lat: -8.109381,
    lng: -34.891207,
  }),
  calculateDistance: jest.fn().mockReturnValue(10000000),
  getDistance: jest.fn().mockResolvedValue(10000000),
};

const mockMelhorEnvioService = {
  calculate: jest.fn().mockResolvedValue({
    type: 'LOJA',
    shipping: [
      { estimatedDelivery: '20 dias úteis', price: 200.0, description: 'PAC' },
      {
        estimatedDelivery: '10 dias úteis',
        price: 400.0,
        description: 'SEDEX',
      },
    ],
  }),
};

describe('StoreController (e2e)', () => {
  let app: NestFastifyApplication;
  let storeModel: typeof import('mongoose').Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ViaCepService)
      .useValue(mockViaCepService)
      .overrideProvider(GoogleMapsService)
      .useValue(mockGoogleMapsService)
      .overrideProvider(MelhorEnvioService)
      .useValue(mockMelhorEnvioService)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    storeModel = app.get(getModelToken('Store'));
  });

  beforeEach(async () => {
    await storeModel.deleteMany({});
    await storeModel.create({
      _id: '67cb6061a9a283add117ff16-id',
      storeName: 'Loja Boa Viagem',
      zipCode: '51021010',
      address: 'Avenida Conselheiro Aguiar',
      number: '1706',
      neighborhood: 'Boa Viagem',
      city: 'Recife',
      state: 'Pernambuco',
      phoneNumber: '81988887777',
      businessHour: '09:00-19:00',
      type: 'LOJA',
      location: { type: 'Point', coordinates: [-34.889553, -8.119294] },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // listAllStores
  it('GET /store deve retornar 200 e um array com todas as lojas cadastradas', async () => {
    const res = await app.inject({ method: 'GET', url: '/store' });
    expect(res.statusCode).toBe(200);

    const body: ListAllResponseDto = res.json();

    expect(body).toHaveProperty('status', 'success');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('stores');
    expect(Array.isArray(body.data.stores)).toBe(true);
    expect(typeof body.limit).toBe('number');
    expect(typeof body.offset).toBe('number');
    expect(typeof body.total).toBe('number');
  });

  it('GET /store deve retornar 404 se não houver lojas cadastradas', async () => {
    await storeModel.deleteMany({});

    const res = await app.inject({ method: 'GET', url: '/store' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toHaveProperty('message', 'Nenhuma loja cadastrada');
  });

  // storeById
  it('GET /store/id/:id deve retornar 200 se id existir', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/store/id/67cb6061a9a283add117ff16-id',
    });

    expect(res.json()).toHaveProperty('status', 'success');
    expect(res.json()).toHaveProperty('data');
  });

  it('GET /store/id/:id deve retornar 404 para id inexistente', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/store/id/invalid-id',
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toHaveProperty('statusCode', 404);
  });

  // storeByState
  it('GET /store/state/Pernambuco deve retornar 200 e um array com lojas existentes no estado', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/store/state/Pernambuco',
    });
    expect(res.statusCode).toBe(200);

    const body: StoreByStateResponseDto = res.json();

    expect(body).toHaveProperty('status', 'success');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('stores');
    expect(Array.isArray(body.data.stores)).toBe(true);
    expect(typeof body.limit).toBe('number');
    expect(typeof body.offset).toBe('number');
    expect(typeof body.total).toBe('number');
  });

  it('GET /store/state/Alagoas deve retornar 404: sem lojas cadastradas para o estado', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/store/state/Alagoas',
    });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toHaveProperty('statusCode', 404);
  });

  // storeByCep
  it('GET /store/cep/:cep deve retornar 200 com a loja mais próxima e opção de frete', async () => {
    const res = await app.inject({ method: 'GET', url: '/store/cep/50930070' });
    expect(res.statusCode).toBe(200);

    const body: StoreByCepResponseDto = res.json();

    expect(body).toHaveProperty('status', 'success');
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty('pins');
    expect(Array.isArray(body.pins)).toBe(true);
    expect(typeof body.limit).toBe('number');
    expect(typeof body.offset).toBe('number');
    expect(typeof body.total).toBe('number');
  });

  it('GET /store/cep/:cep deve retornar 400 para CEP inválido', async () => {
    const res = await app.inject({ method: 'GET', url: '/store/cep/000' });
    expect(res.statusCode).toBe(400);
  });

  it('GET /store/cep/:cep deve retornar 404 se não houver lojas cadastradas', async () => {
    await storeModel.deleteMany({});
    const res = await app.inject({ method: 'GET', url: '/store/cep/50930070' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /store/cep/:cep deve retornar 404 se não houver rota entre o CEP e a loja', async () => {
    mockGoogleMapsService.getDistance.mockRejectedValueOnce(
      new HttpException(
        '[GoogleMapsService] getDistance - Nenhuma rota disponível entre os pontos informados.',
        HttpStatus.NOT_FOUND,
      ),
    );
    const res = await app.inject({ method: 'GET', url: '/store/cep/50930070' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /store/cep/:cep deve retornar 500 se o serviço externo falhar', async () => {
    mockViaCepService.getCepData.mockRejectedValueOnce(
      new Error('Erro externo'),
    );
    const res = await app.inject({ method: 'GET', url: '/store/cep/50930070' });
    expect(res.statusCode).toBe(500);
  });

  it('GET /store/cep/:cep deve retornar frete Motoboy se loja for próxima', async () => {
    mockGoogleMapsService.getDistance.mockResolvedValueOnce(10);
    mockMelhorEnvioService.calculate.mockResolvedValueOnce({
      type: 'PDV',
      shipping: [
        {
          estimatedDelivery: '1 dia útil',
          price: 50.0,
          description: 'Motoboy',
        },
      ],
    });
    const res = await app.inject({ method: 'GET', url: '/store/cep/50930070' });
    const body: StoreByCepResponseDto = res.json();
    expect(body.data[0].type).toBe('PDV');
    expect(body.data[0].shipping[0].description).toBe('Motoboy');
  });

  // pagination

  it('GET /store deve retornar 2 lojas a partir do offset 1 (paginação)', async () => {
    // Limpa e cadastra 4 lojas
    await storeModel.deleteMany({});
    await storeModel.create([
      {
        _id: '1',
        storeName: 'Loja 1',
        zipCode: '51021011',
        address: 'Rua 1',
        number: '1',
        neighborhood: 'Bairro 1',
        city: 'Recife',
        state: 'Pernambuco',
        phoneNumber: '81988880001',
        businessHour: '09:00-19:00',
        type: 'LOJA',
        location: { type: 'Point', coordinates: [-34.889551, -8.119291] },
      },
      {
        _id: '2',
        storeName: 'Loja 2',
        zipCode: '51021012',
        address: 'Rua 2',
        number: '2',
        neighborhood: 'Bairro 2',
        city: 'Recife',
        state: 'Pernambuco',
        phoneNumber: '81988880002',
        businessHour: '09:00-19:00',
        type: 'LOJA',
        location: { type: 'Point', coordinates: [-34.889552, -8.119292] },
      },
      {
        _id: '3',
        storeName: 'Loja 3',
        zipCode: '51021013',
        address: 'Rua 3',
        number: '3',
        neighborhood: 'Bairro 3',
        city: 'Recife',
        state: 'Pernambuco',
        phoneNumber: '81988880003',
        businessHour: '09:00-19:00',
        type: 'LOJA',
        location: { type: 'Point', coordinates: [-34.889553, -8.119293] },
      },
      {
        _id: '4',
        storeName: 'Loja 4',
        zipCode: '51021014',
        address: 'Rua 4',
        number: '4',
        neighborhood: 'Bairro 4',
        city: 'Recife',
        state: 'Pernambuco',
        phoneNumber: '81988880004',
        businessHour: '09:00-19:00',
        type: 'LOJA',
        location: { type: 'Point', coordinates: [-34.889554, -8.119294] },
      },
    ]);

    const res = await app.inject({
      method: 'GET',
      url: '/store?limit=2&offset=1',
    });

    expect(res.statusCode).toBe(200);
    const body: ListAllResponseDto = res.json();

    expect(body).toHaveProperty('status', 'success');
    expect(body.data.stores.length).toBe(2);
    expect(body.limit).toBe(2);
    expect(body.offset).toBe(1);
    expect(body.total).toBe(4);
  });
});
