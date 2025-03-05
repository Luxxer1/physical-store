import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ path: './config.env' });

if (!process.env.DATABASE_PASSWORD) {
  throw new Error('DATABASE_PASSWORD is not defined');
}

const DB = process.env.DATABASE?.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

if (!DB) {
  throw new Error('DATABASE URL is not defined or invalid');
}

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
