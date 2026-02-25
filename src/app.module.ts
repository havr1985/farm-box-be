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
import { ProductsModule } from '@modules/products/products.module';
import { OrdersModule } from '@modules/orders/orders.module';
import { FarmsModule } from '@modules/farms/farms.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { GraphqlModule } from '@infrastructure/graphql/graphql.module';
import { AuthModule } from '@modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { PermissionGuard } from '@modules/auth/guards/permission.guard';
import { StorageModule } from './infrastructure/storage/storage.module';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
      validate,
    }),
    EventEmitterModule.forRoot({ wildcard: true }),
    DatabaseModule,
    LoggerModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    FarmsModule,
    CategoriesModule,
    GraphqlModule,
    AuthModule,
    StorageModule,
    FilesModule,
    HealthModule,
    NotificationsModule,
  ],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
