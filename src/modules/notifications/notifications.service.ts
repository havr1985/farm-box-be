import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NotificationsGateway } from '@modules/notifications/notifications.gateway';
import { PinoLogger } from 'nestjs-pino';
import { bufferTime, filter, map, Subject, Subscription } from 'rxjs';
import {
  OrderEvent,
  OrderEventType,
} from '@modules/notifications/events/order.events';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly orderEvents$ = new Subject<OrderEvent>();
  private readonly subscriptions: Subscription[] = [];
  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(NotificationsService.name);
  }

  onModuleInit(): void {
    this.subscribeToUserEvents();
    this.subscribeToAdmin();
  }

  onModuleDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) =>
      subscription.unsubscribe(),
    );
    this.orderEvents$.complete();
  }

  @OnEvent('order.*')
  handleOrderEvent(event: OrderEvent) {
    this.logger.info(`Order event: ${event.type} [${event.orderId}]`);
    this.orderEvents$.next(event);
  }

  private subscribeToUserEvents() {
    const sub = this.orderEvents$.subscribe((event: OrderEvent) => {
      switch (event.type) {
        case OrderEventType.CREATED:
          this.gateway.sendToFarm(event.farmId, 'order:created', event);
          this.gateway.sendToUser(event.customerId, 'order:created', event);
          break;

        case OrderEventType.CONFIRMED:
        case OrderEventType.SHIPPED:
        case OrderEventType.DELIVERED:
          this.gateway.sendToUser(
            event.customerId,
            'order:status-changed',
            event,
          );
          break;

        case OrderEventType.CANCELLED:
          this.gateway.sendToFarm(event.farmId, 'order:cancelled', event);
          this.gateway.sendToUser(event.customerId, 'order:cancelled', event);
          break;
      }
    });
    this.subscriptions.push(sub);
  }

  private subscribeToAdmin() {
    const sub = this.orderEvents$
      .pipe(
        bufferTime(500),
        filter((events) => events.length > 0),
        map((events) => ({
          count: events.length,
          totalCents: events.reduce((sum, e) => sum + e.totalCents, 0),
          events,
        })),
      )
      .subscribe((batch) => {
        this.logger.info(`Admin batch: ${batch.count} events`);
        this.gateway.sendToAdmin('order:batch', batch);
      });
    this.subscriptions.push(sub);
  }
}
