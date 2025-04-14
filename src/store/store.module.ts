import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Store, StoreSchema } from './store.model';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
      }),
    }),
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    HttpModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
