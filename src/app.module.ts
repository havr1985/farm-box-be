import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from '@config/configuration';
import { validate } from '@config/env.validation';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { CorrelationIdMiddleware } from '@common/middleware/correlation-id.middleware';
import { LoggerModule } from '@common/logger/logger.module';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { UsersModule } from '@modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

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
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
  providers: [GlobalExceptionFilter],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
