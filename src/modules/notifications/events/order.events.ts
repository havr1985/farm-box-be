import { OrderStatus } from '@modules/orders/enums/order-status.enum';

export enum OrderEventType {
  CREATED = 'order.created',
  CONFIRMED = 'order.confirmed',
  SHIPPED = 'order.shipped',
  DELIVERED = 'order.delivered',
  CANCELLED = 'order.cancelled',
}

export class OrderEvent {
  type: OrderEventType;
  orderId: string;
  idempotencyKey: string;
  customerId: string;
  farmId: string;
  farmName: string;
  totalCents: number;
  status: OrderStatus;
  occurredAt: Date;
}
