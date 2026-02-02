import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from '@config/configuration';
import { validate } from '@config/env.validation';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { CorrelationIdMiddleware } from '@common/middleware/correlation-id.middleware';
import { LoggerModule } from '@common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
      validate,
    }),
    DatabaseModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
