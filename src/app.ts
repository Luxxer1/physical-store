import express from 'express';
import storeRouter from './routes/storeRoutes';

const app = express();

app.use(express.json());

app.use('/stores', storeRouter);

export default app;

// import fetch from "node-fetch";

// const response = await fetch("https://viacep.com.br/ws/50930070/json/");
// const data = await response.json();

// console.log(data);
