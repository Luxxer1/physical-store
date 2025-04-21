# Physical Store API

API RESTful desenvolvida em NestJS para localizar lojas físicas e calcular opções de frete com base no CEP do cliente.

## Tecnologias

- Node.js
- NestJS
- TypeScript
- MongoDB (Mongoose)
- Swagger (OpenAPI)
- Jest (Testes unitários e E2E)

## Funcionalidades

- Listagem de todas as lojas cadastradas com paginação.
- Busca de loja por ID.
- Busca de lojas por estado.
- Busca da loja mais próxima e cálculo de frete (Motoboy, Sedex, PAC) a partir de um CEP.
- Integração simulada com ViaCEP, Google Maps e MelhorEnvio.
- Tratamento global de exceções e logs estruturados.

## Instalação

```bash
git clone https://github.com/seu-usuario/physical-store.git
cd physical-store
npm install
```

## Configuração

Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

```bash
DATABASE_URI=mongodb://localhost:27017/physical-store
GOOGLE_API_KEY=sua_google_api_key
MELHOR_ENVIO_TOKEN=seu_token_melhor_envio
```

## Executando o Projeto

### Desenvolvimento

```bash
npm run start:dev
```

Acesse a documentação Swagger em:  
http://localhost:3000/swagger

### Produção

```bash
npm run build
npm run start:prod
```

## Testes

### Unitários e integração

```bash
npm run test
```

### E2E

```bash
npm run test:e2e
```

### Cobertura

```
npm run test:cov
```

## Endpoints Principais

- GET /store — Lista todas as lojas (com paginação)
- GET /store/id/:id — Busca loja por ID
- GET /store/state/:state — Busca lojas por estado
- GET /store/cep/:cep — Busca loja mais próxima e opções de frete

Consulte exemplos de request/response e parâmetros na documentação Swagger.

## Estrutura do Projeto

- src/store — Módulo principal de lojas (controller, service, model, DTOs)
- src/common — Serviços externos, DTOs, filtros, logger, utils
- test — Testes E2E

## Scripts úteis

- npm run lint — Lint do código
- npm run format — Formata o código com Prettier

## Observações

- Os serviços externos (ViaCEP, Google Maps, MelhorEnvio) são mockados nos testes.
- O projeto segue princípios de Clean Code, SOLID e boas práticas de API REST.

## Autor

- [Lucas Bastos](https://github.com/Luxxer1)

## Contribuição

Sinta-se à vontade para contribuir com o projeto. Se você identificar um erro ou tiver uma sugestão de melhoria, abra uma issue ou submeta um pull request.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Projeto desenvolvido para o Desafio 3 do Programa de Bolsas Backend (Node.js) — Compasso UOL.
