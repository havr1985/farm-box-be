import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderFulfillment } from '@modules/orders/entities/order-fulfillment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderFulfillmentsRepository {
  constructor(
    @InjectRepository(OrderFulfillment)
    private readonly repository: Repository<OrderFulfillment>,
  ) {}

  async save(fulfillment: OrderFulfillment): Promise<OrderFulfillment> {
    return this.repository.save(fulfillment);
  }
}
