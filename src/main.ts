import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import metadata from './metadata';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      abortOnError: false,
    },
  );

  const config = new DocumentBuilder()
    .setTitle('Physical Store')
    .setDescription(
      'API REST para localizar lojas físicas e calcular opções de frete com base no CEP.',
    )
    .setVersion('2.0')
    .addTag('Store')
    .build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
    customCss: `.swagger-ui .models { display: none !important; }`,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
