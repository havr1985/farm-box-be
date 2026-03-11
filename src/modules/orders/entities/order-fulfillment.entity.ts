import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Order } from '@modules/orders/entities/order.entity';
import { Farm } from '@modules/farms/entities/farm.entity';
import { OrderItem } from '@modules/orders/entities/order-item.entity';
import { OrderStatus } from '@modules/orders/enums/order-status.enum';

@Entity('order_fulfillments')
export class OrderFulfillment extends BaseEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'farm_id', type: 'uuid' })
  farmId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status_enum',
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'subtotal_cents', type: 'int' })
  subtotalCents: number;

  @ManyToOne(() => Order, (order) => order.fulfillments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @OneToMany(() => OrderItem, (item) => item.fulfillment)
  items: OrderItem[];
}
