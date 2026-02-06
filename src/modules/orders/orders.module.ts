import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@modules/orders/entities/order.entity';
import { OrderItem } from '@modules/orders/entities/order-item.entity';
import { OrdersRepository } from '@modules/orders/orders.repository';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), UsersModule],
  providers: [OrdersService, OrdersRepository],
  controllers: [OrdersController],
})
export class OrdersModule {}
