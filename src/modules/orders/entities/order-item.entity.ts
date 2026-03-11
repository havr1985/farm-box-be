import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { OrderFulfillment } from '@modules/orders/entities/order-fulfillment.entity';

@Entity('order_items')
@Check('CHK_quantity_non_negative', '"quantity" > 0')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'fulfillment_id', type: 'uuid' })
  fulfillmentId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'product_name_snapshot', type: 'varchar', length: 255 })
  productNameSnapshot: string;

  @Column({
    name: 'price_cents_snapshot',
    type: 'int',
  })
  priceCentsSnapshot: number;

  @Column({ name: 'farm_name_snapshot', type: 'varchar', length: 255 })
  farmNameSnapshot: string;

  @ManyToOne(() => OrderFulfillment, (f) => f.items)
  @JoinColumn({ name: 'fulfillment_id' })
  fulfillment: OrderFulfillment;

  @Column({ name: 'line_total_cents', type: 'int' })
  lineTotalCents: number;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
