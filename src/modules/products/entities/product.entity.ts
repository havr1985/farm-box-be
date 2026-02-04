import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderItem } from '@modules/orders/entities/order-item.entity';
import { Farm } from '@modules/farms/entities/farm.entity';
import { Category } from '@modules/categories/entities/category.entity';

export enum ProductUnit {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  PCS = 'pcs',
}

@Entity('products')
@Index('IDX_products_sku_unique', ['sku'], { unique: true })
@Index('IDX_products_name', ['name'])
@Index('IDX_products_farm_id', ['farmId'])
@Index('IDX_products_category_id', ['categoryId'])
@Index('IDX_products_is_active', ['isActive'])
@Check('CHK_stock_positive', '"stock" >= 0')
@Check('CHK_price_cents_positive', '"price_cents" >= 0')
export class Product extends BaseEntity {
  @Column({ name: 'farm_id', type: 'uuid' })
  farmId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ name: 'compare_at_price_cents', type: 'int', nullable: true })
  compareAtPriceCents: number | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: ProductUnit,
    enumName: 'product_unit_enum',
    default: ProductUnit.PCS,
  })
  unit: ProductUnit;

  @Column({ name: 'is_organic', type: 'boolean', default: false })
  isOrganic: boolean;

  @Column({ name: 'harvest_date', type: 'date', nullable: true })
  harvestDate: Date | null;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Farm, (farm) => farm.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
