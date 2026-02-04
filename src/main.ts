import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ResponseTransformInterceptor } from '@common/interceptors/response-transform.interceptor';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix('api');

  const logger = app.get<Logger>(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const config = new DocumentBuilder()
    .setTitle('GroceryFlow API')
    .setDescription('E-commerce Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'x-correlation-id', in: 'header' },
      'CorrelationId',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('app.port') || 3000;
  const env = configService.get<string>('app.nodeEnv') || 'development';

  await app.listen(port);
  logger.log(`Server running on port: ${port}. Env: ${env}`);
}
bootstrap();
