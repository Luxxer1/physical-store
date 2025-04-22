import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/logger/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { StoreModule } from 'src/store/store.module';
import configuration from 'src/config/configuration';

const envFilePath = `${process.cwd()}/${process.env.NODE_ENV || 'development'}.env`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [configuration],
    }),
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
