import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Store, StoreSchema } from './store.model';
import { HttpModule } from '@nestjs/axios';
import { ViaCepService } from 'src/common/services/via-cep.service';
import { GoogleMapsService } from 'src/common/services/google-maps.service';
import { MelhorEnvioService } from 'src/common/services/melhor-envio.service';

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
  providers: [
    StoreService,
    ViaCepService,
    GoogleMapsService,
    MelhorEnvioService,
  ],
})
export class StoreModule {}
