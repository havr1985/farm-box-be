import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableVersioning({ type: VersioningType.URI });

  const port = configService.get<number>('app.port') || 3000;
  const env = configService.get<string>('app.nodeEnv') || 'development';

  await app.listen(port, () =>
    console.log(`Listening on port ${port}. Env: ${env}`),
  );
}
bootstrap();
