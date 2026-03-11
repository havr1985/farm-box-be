import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '@modules/orders/repositories/orders.repository';
import { UsersService } from '@modules/users/users.service';
import { DataSource } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';
import { Order } from '@modules/orders/entities/order.entity';
import { Product } from '@modules/products/entities/product.entity';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InsufficientStockException,
  NotFoundException,
} from '@common/exceptions/app.exception';
import { OrderItem } from '@modules/orders/entities/order-item.entity';
import { isUniqueViolation } from '@common/utils/database-error.utils';
import { OrdersFilterInput } from '@modules/orders/graphql/inputs/orders-filter.input';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { getUserPermissions } from '@modules/auth/constants/permissions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OrderEvent,
  OrderEventType,
} from '@modules/notifications/events/order.events';
import { OrderStatus } from '@modules/orders/enums/order-status.enum';
import { OrderFulfillment } from '@modules/orders/entities/order-fulfillment.entity';
import { ORDER_TRANSITIONS } from '@modules/orders/constants/order-transitions.constants';
import { UserRole } from '@modules/users/entities/user.entity';
import { OrderFulfillmentsRepository } from '@modules/orders/repositories/order-fulfillments.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly fulfillmentRepository: OrderFulfillmentsRepository,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrdersService.name);
  }

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    await this.usersService.findById(userId);
    const existingOrder = await this.ordersRepository.findByIdempotencyKey(
      userId,
      createOrderDto.idempotencyKey,
    );
    if (existingOrder) {
      this.logger.info(
        {
          orderId: existingOrder.id,
          idempotencyKey: createOrderDto.idempotencyKey,
        },
        'Duplicate order detected, returning existing',
      );
      return existingOrder;
    }
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const productIds = [
        ...new Set(createOrderDto.items.map((item) => item.productId)),
      ];
      const products = await qr.manager
        .createQueryBuilder(Product, 'p')
        .setLock('pessimistic_write')
        .where('p.id IN (:...ids)', { ids: productIds })
        .innerJoinAndSelect('p.farm', 'farm')
        .getMany();

      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id));
        const missingId = productIds.find((id) => !foundIds.has(id));
        throw new NotFoundException('Product', missingId);
      }

      const productsMap = new Map(products.map((p) => [p.id, p]));
      let totalCents = 0;
      const farmItemsMap = new Map<
        string,
        { farmName: string; items: Partial<OrderItem>[]; subtotalCents: number }
      >();
      for (const item of createOrderDto.items) {
        const product = productsMap.get(item.productId);
        if (!product?.isActive) {
          throw new NotFoundException('Product', item.productId);
        }
        if (product.stock < item.quantity) {
          throw new InsufficientStockException(
            product.id,
            item.quantity,
            product.stock,
          );
        }
        const lineTotalCents = product.priceCents * item.quantity;
        totalCents += lineTotalCents;

        const farmId = product.farm.id;
        if (!farmItemsMap.has(farmId)) {
          farmItemsMap.set(farmId, {
            farmName: product.farm.name,
            items: [],
            subtotalCents: 0,
          });
        }

        const group = farmItemsMap.get(farmId)!;
        group.subtotalCents += lineTotalCents;
        group.items.push({
          productId: item.productId,
          quantity: item.quantity,
          productNameSnapshot: product.name,
          priceCentsSnapshot: product.priceCents,
          farmNameSnapshot: product.farm.name,
          lineTotalCents,
        });
      }

      for (const item of createOrderDto.items) {
        await qr.manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => `stock - ${item.quantity}` })
          .where('id = :id', { id: item.productId })
          .execute();
      }
      const order = qr.manager.create(Order, {
        userId,
        idempotencyKey: createOrderDto.idempotencyKey,
        status: OrderStatus.PENDING,
        totalCents,
        finalCents: totalCents,
      });
      const savedOrder = await qr.manager.save(order);

      for (const [farmId, group] of farmItemsMap) {
        const fulfillment = qr.manager.create(OrderFulfillment, {
          orderId: savedOrder.id,
          farmId,
          status: OrderStatus.PENDING,
          subtotalCents: group.subtotalCents,
        });
        const savedFulfillment = await qr.manager.save(fulfillment);

        const items = group.items.map((i) =>
          qr.manager.create(OrderItem, {
            ...i,
            fulfillmentId: savedFulfillment.id,
          }),
        );
        await qr.manager.save(items);
      }

      await qr.commitTransaction();

      this.emitOrderCreatedEvents(savedOrder, farmItemsMap, userId);

      this.logger.info(
        {
          orderId: savedOrder.id,
          userId,
          totalCents,
        },
        'Order created successfully',
      );
      return savedOrder;
    } catch (error) {
      await qr.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof InsufficientStockException
      )
        throw error;
      if (isUniqueViolation(error)) {
        this.logger.warn(
          { idempotencyKey: createOrderDto.idempotencyKey },
          'Idempotency race condition — fetching existing order',
        );

        const existing = await this.ordersRepository.findByIdempotencyKey(
          userId,
          createOrderDto.idempotencyKey,
        );

        if (existing) return existing;
      }

      this.logger.error({ userId }, 'Failed to create order');
      throw error;
    } finally {
      await qr.release();
    }
  }

  async findOne(id: string, currentUser: AccessTokenPayload): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order', id);
    }
    const permissions = getUserPermissions(currentUser.roles);
    if (permissions.includes('orders:read:any')) return order;
    if (order.userId !== currentUser.sub) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  async findByUser(
    userId: string,
    cursor?: string,
    limit: number = 20,
    filter?: OrdersFilterInput,
  ): Promise<{ orders: Order[]; nextCursor: string | null }> {
    await this.usersService.findById(userId);
    return this.ordersRepository.findByUser(userId, cursor, limit, filter);
  }

  async cancelOrder(
    id: string,
    currentUser: AccessTokenPayload,
  ): Promise<Order> {
    const order = await this.findOne(id, currentUser);

    const permissions = getUserPermissions(currentUser.roles);
    if (
      !permissions.includes('orders:cancel:any') &&
      order.userId !== currentUser.sub
    ) {
      throw new ForbiddenException('You can only cancel your own orders');
    }
    const cancelableStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.CONFIRMED,
    ];
    if (!cancelableStatuses.includes(order.status)) {
      this.logger.error(
        `Order with status '${order.status}' cannot be canceled`,
      );
      throw new ConflictException(
        `Order with status '${order.status}' cannot be canceled`,
      );
    }

    const hasShipped = order.fulfillments.some(
      (f) =>
        f.status === OrderStatus.SHIPPED || f.status === OrderStatus.DELIVERED,
    );

    if (hasShipped) {
      throw new ConflictException(
        'Cannot cancel order — some items have already been shipped',
      );
    }

    const activeFulfillments = order.fulfillments.filter(
      (f) => f.status !== OrderStatus.CANCELED,
    );

    if (activeFulfillments.length === 0) {
      throw new ConflictException('Order is already canceled');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      for (const fulfillment of activeFulfillments) {
        for (const item of fulfillment.items) {
          await qr.manager
            .createQueryBuilder()
            .update(Product)
            .set({ stock: () => `stock + ${item.quantity}` })
            .where('id = :id', { id: item.productId })
            .execute();
        }
        fulfillment.status = OrderStatus.CANCELED;
        await qr.manager.save(fulfillment);
      }
      order.status = OrderStatus.CANCELED;
      const savedOrder = await qr.manager.save(order);

      await qr.commitTransaction();
      this.emitOrderCanceledEvents(activeFulfillments, savedOrder);
      return savedOrder;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  async updateFulfilmentStatus(
    orderId: string,
    fulfillmentId: string,
    newStatus: OrderStatus,
    user: AccessTokenPayload,
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order', orderId);
    }
    const fulfillment = order.fulfillments.find((f) => f.id === fulfillmentId);
    if (!fulfillment) {
      throw new NotFoundException('Fulfillment', fulfillmentId);
    }
    const transitions = ORDER_TRANSITIONS[fulfillment.status];
    const transition = transitions.find((t) => t.to === newStatus);
    if (!transition) {
      throw new BadRequestException(
        `Cannot transition from ${fulfillment.status} to ${newStatus}`,
      );
    }
    const hasRole = user.roles.some((r) => transition.roles.includes(r));
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to this transition',
      );
    }
    if (
      !user.roles.includes(UserRole.ADMIN) &&
      fulfillment.farmId !== user.farmId
    ) {
      throw new ForbiddenException(
        'You can only manage your own farm fulfillments',
      );
    }

    fulfillment.status = newStatus;
    await this.fulfillmentRepository.save(fulfillment);

    order.status = this.computeOrderStatus(order.fulfillments);
    await this.ordersRepository.save(order);

    this.eventEmitter.emit(`order.${newStatus}`, {
      type: `order.${newStatus}` as OrderEventType,
      orderId: order.id,
      idempotencyKey: order.idempotencyKey,
      customerId: order.userId,
      farmId: fulfillment.farmId,
      farmName: '',
      totalCents: fulfillment.subtotalCents,
      status: newStatus,
      occurredAt: new Date(),
    } satisfies OrderEvent);
    return order;
  }

  private emitOrderCreatedEvents(
    order: Order,
    farmItemsMap: Map<
      string,
      {
        farmName: string;
        items: Partial<OrderItem>[];
        subtotalCents: number;
      }
    >,
    customerId: string,
  ): void {
    for (const [farmId, group] of farmItemsMap) {
      this.eventEmitter.emit('order.created', {
        type: OrderEventType.CREATED,
        orderId: order.id,
        idempotencyKey: order.idempotencyKey,
        customerId,
        farmId,
        farmName: group.farmName,
        totalCents: group.subtotalCents,
        status: OrderStatus.PENDING,
        occurredAt: new Date(),
      } satisfies OrderEvent);
    }
  }

  private emitOrderCanceledEvents(
    activeFulfillments: OrderFulfillment[],
    order: Order,
  ): void {
    for (const fulfillment of activeFulfillments) {
      this.eventEmitter.emit('order.canceled', {
        type: OrderEventType.CANCELLED,
        orderId: order.id,
        idempotencyKey: order.idempotencyKey,
        customerId: order.userId,
        farmId: fulfillment.farmId,
        farmName: fulfillment.farm.name,
        totalCents: fulfillment.subtotalCents,
        status: OrderStatus.CANCELED,
        occurredAt: new Date(),
      } satisfies OrderEvent);
    }
  }

  private computeOrderStatus(fulfillments: OrderFulfillment[]): OrderStatus {
    const active = fulfillments.filter(
      (f) => f.status !== OrderStatus.CANCELED,
    );

    if (active.length === 0) return OrderStatus.CANCELED;

    const priority: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CONFIRMED]: 1,
      [OrderStatus.PROCESSING]: 2,
      [OrderStatus.SHIPPED]: 3,
      [OrderStatus.DELIVERED]: 4,
      [OrderStatus.CANCELED]: -1,
    };

    return active.reduce((lowest, f) =>
      priority[f.status] < priority[lowest.status] ? f : lowest,
    ).status;
  }
}
