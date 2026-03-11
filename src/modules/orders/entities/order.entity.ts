import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { OrderFulfillment } from '@modules/orders/entities/order-fulfillment.entity';
import { OrderStatus } from '@modules/orders/enums/order-status.enum';

@Entity('orders')
@Index('IDX_orders_user_id', ['userId'])
@Index('IDX_orders_created_at', ['createdAt'])
@Index('IDX_orders_user_idempotency', ['userId', 'idempotencyKey'], {
  unique: true,
})
export class Order extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 120,
  })
  idempotencyKey: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'orders_status_enum',
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'total_cents', type: 'int', default: 0 })
  totalCents: number;

  @Column({ name: 'discount_cents', type: 'int', default: 0 })
  discountCents: number;

  @Column({ name: 'delivery_cents', type: 'int', default: 0 })
  deliveryCents: number;

  @Column({ name: 'final_cents', type: 'int', default: 0 })
  finalCents: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderFulfillment, (f) => f.order)
  fulfillments: OrderFulfillment[];
}
