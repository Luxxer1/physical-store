/* eslint-disable */
export default async () => {
  const t = {};
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./common/dtos/cep.dto'),
          {
            CepDto: {
              cep: {
                required: true,
                type: () => String,
                pattern: '/^\\d{5}-?\\d{3}$/',
              },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./store/store.controller'),
          {
            StoreController: {
              listAll: {},
              storeByCep: {},
              storeById: {},
              storeByState: {},
            },
          },
        ],
      ],
    },
  };
};
