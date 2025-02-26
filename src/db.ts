import { Client } from 'pg';

const client = new Client({
  user: 'blabla',
  host: 'localhost',
  database: 'storesdb',
  password: 'blabla',
  port: 5432,
});

client.connect();

export default client;
