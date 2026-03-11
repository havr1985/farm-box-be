import { registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '@modules/orders/enums/order-status.enum';

registerEnumType(OrderStatus, {
  name: 'order_status',
  description: 'Order status',
});

export { OrderStatus };
