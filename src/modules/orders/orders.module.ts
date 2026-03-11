import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@modules/orders/entities/order.entity';
import { OrderItem } from '@modules/orders/entities/order-item.entity';
import { OrdersRepository } from '@modules/orders/repositories/orders.repository';
import { UsersModule } from '@modules/users/users.module';
import { OrdersResolver } from '@modules/orders/graphql/resolvers/orders.resolver';
import { OrderItemsResolver } from '@modules/orders/graphql/resolvers/order-items.resolver';
import { OrderFulfillment } from '@modules/orders/entities/order-fulfillment.entity';
import { OrderFulfillmentsRepository } from '@modules/orders/repositories/order-fulfillments.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderFulfillment, OrderItem]),
    UsersModule,
  ],
  providers: [
    OrdersService,
    OrdersRepository,
    OrdersResolver,
    OrderItemsResolver,
    OrderFulfillmentsRepository,
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
