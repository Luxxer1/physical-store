import express from 'express';
import storeRouter from './routes/storeRoutes';

const app = express();

app.use(express.json());

app.use('/stores', storeRouter);

export default app;
