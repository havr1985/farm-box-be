import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '@modules/orders/entities/order.entity';
import { Repository } from 'typeorm';
import { OrdersFilterInput } from '@modules/orders/graphql/inputs/orders-filter.input';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async findById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: { fulfillments: { items: true } },
    });
  }

  async findByIdempotencyKey(
    userId: string,
    idempotencyKey: string,
  ): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { userId, idempotencyKey },
      relations: { fulfillments: { items: true } },
    });
  }

  async findByUser(
    userId: string,
    cursor?: string,
    limit: number = 20,
    filter?: OrdersFilterInput,
  ): Promise<{ orders: Order[]; nextCursor: string | null }> {
    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.fulfillments', 'fulfillment')
      .leftJoinAndSelect('fulfillment.items', 'items')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .take(limit + 1);
    if (cursor) {
      qb.andWhere('order.createdAt < :cursor', { cursor });
    }

    if (filter?.status) {
      qb.andWhere('order.status = :status', { status: filter.status });
    }

    if (filter?.dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', {
        dateFrom: filter.dateFrom,
      });
    }

    if (filter?.dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', { dateTo: filter.dateTo });
    }

    const orders = await qb.getMany();

    const hasNext = orders.length > limit;
    if (hasNext) orders.pop();

    const nextCursor = hasNext
      ? orders[orders.length - 1].createdAt.toISOString()
      : null;

    return { orders, nextCursor };
  }

  async save(order: Order): Promise<Order> {
    return this.ordersRepository.save(order);
  }
}
