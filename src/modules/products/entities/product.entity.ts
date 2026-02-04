import { Check, Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderItem } from '@modules/orders/entities/order-item.entity';

@Entity('products')
@Index('IDX_products_sku_unique', ['sku'], { unique: true })
@Index('IDX_products_name', ['name'])
@Check('CHK_stock_positive', '"stock" >= 0')
@Check('CHK_price_cents_positive', '"price_cents" >= 0')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
