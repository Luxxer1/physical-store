import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/logger/logger.middleware';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'config.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbPassword = config.get<string>('DATABASE_PASSWORD');
        const dbUri = config.get<string>('DATABASE');
        if (!dbPassword) {
          throw new Error('❌ DATABASE_PASSWORD is not defined');
        }
        if (!dbUri) {
          throw new Error('❌ DATABASE is not defined');
        }
        const uri = dbUri.replace('<db_password>', dbPassword);
        console.log('✅ Conectando ao MongoDB com URI:', uri);
        return { uri };
      },
    }),
    StoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
