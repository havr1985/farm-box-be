import { registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '@modules/orders/entities/order.entity';

registerEnumType(OrderStatus, {
  name: 'order_status',
  description: 'Order status',
});

export { OrderStatus };
