# Physical Store - API de Lojas Físicas

Este projeto tem o objetivo de criar uma API que fornece informações sobre lojas físicas, incluindo a busca de lojas próximas a um CEP informado pelo usuário.

A API é construída utilizando **Node.js**, **Express**, **MongoDB** e **Axios** para integração com APIs externas, como a API do ViaCEP e Google Geocoding API.

## Funcionalidades

### 1. Buscar todas as lojas

Endpoint para recuperar todas as lojas cadastradas no banco de dados.

- **Endpoint:** `GET /stores`
- **Resposta:**
  - **status:** 'success'
  - **length:** Número de lojas encontradas
  - **data:** Lista de lojas

### 2. Buscar lojas próximas ao CEP

Busca lojas próximas a um CEP fornecido. Para isso, utiliza a API do ViaCEP para obter dados do endereço e a API do Google Maps para geocodificar o endereço e encontrar lojas nas proximidades.

- **Endpoint:** `GET /stores/:cep`
- **Parâmetros:**
  - `cep`: O CEP do qual se deseja encontrar lojas próximas (ex: `04020001`).
- **Respostas:**
  - **status:** 'success' ou 'fail'
  - **length:** Número de lojas encontradas
  - **data:** Lojas próximas, se encontradas, ou uma mensagem de erro caso contrário

## Tecnologias

- **Node.js**: Ambiente de execução para o JavaScript no backend.
- **Express**: Framework para construção da API.
- **MongoDB**: Banco de dados NoSQL para armazenar as lojas.
- **Axios**: Biblioteca para realizar requisições HTTP.
- **ViaCEP**: API externa para obter informações sobre o endereço a partir de um CEP.
- **Google Maps API**: Utilizada para geolocalização e cálculo de proximidade das lojas.

## Instalação

### Pré-requisitos

Certifique-se de ter o **Node.js** e o **MongoDB** instalados em seu sistema. Caso já tenha instalado, siga os próximos passos para configurar o projeto.

1. Clone este repositório:

   ```bash
   git clone https://github.com/Luxxer1/physical-store.git
   ```

2. Acesse o diretório do projeto:

   ```bash
   cd physical-store
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Crie um arquivo `config.env` na raiz do projeto com as seguintes variáveis de ambiente necessárias:

   ```bash
   DATABASE=mongodb+srv://<seu_usuario>:<db_password>@cluster0.bqscv.mongodb.net/physical_store?retryWrites=true&w=majority&appName=Cluster0
   DATABASE_PASSWORD=<seu_password>
   API_KEY=<sua_chave_de_api_google_maps>
   ```

### Como rodar

Para rodar o servidor localmente, execute o comando:

```bash
npm start
```

O servidor estará disponível em http://localhost:3000.

### Testes

Este projeto não contém testes automatizados atualmente, mas é possível testar manualmente as funcionalidades acessando os endpoints documentados.

### Contribuição

Sinta-se à vontade para contribuir com o projeto. Se você identificar um erro ou tiver uma sugestão de melhoria, abra uma issue ou submeta um pull request.

### Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.
