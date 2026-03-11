import { OrderStatus } from '../enums/order-status.enum';
import { UserRole } from '@modules/users/entities/user.entity';

export const ORDER_TRANSITIONS: Record<
  OrderStatus,
  { to: OrderStatus; roles: UserRole[] }[]
> = {
  [OrderStatus.PENDING]: [
    { to: OrderStatus.CONFIRMED, roles: [UserRole.FARMER, UserRole.ADMIN] },
    { to: OrderStatus.CANCELED, roles: [UserRole.CUSTOMER, UserRole.ADMIN] },
  ],
  [OrderStatus.CONFIRMED]: [
    { to: OrderStatus.PROCESSING, roles: [UserRole.FARMER, UserRole.ADMIN] },
    { to: OrderStatus.CANCELED, roles: [UserRole.CUSTOMER, UserRole.ADMIN] },
  ],
  [OrderStatus.PROCESSING]: [
    { to: OrderStatus.SHIPPED, roles: [UserRole.FARMER, UserRole.ADMIN] },
  ],
  [OrderStatus.SHIPPED]: [
    { to: OrderStatus.DELIVERED, roles: [UserRole.FARMER, UserRole.ADMIN] },
  ],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELED]: [],
};
