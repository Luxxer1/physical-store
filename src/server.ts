import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import AppError from './utils/appError.js';
import logger from './utils/logger.js';

dotenv.config({ path: './config.env' });

if (!process.env.DATABASE_PASSWORD) {
  throw new AppError('DATABASE_PASSWORD is not defined', 500);
}

const DB = process.env.DATABASE?.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

if (!DB) {
  throw new AppError('DATABASE URL is not defined or invalid', 500);
}

mongoose.connect(DB).then(() => logger.info('DB connection successful!'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running at port ${port}`);
});
