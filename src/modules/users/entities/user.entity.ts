import { BaseEntity } from '@common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Order } from '@modules/orders/entities/order.entity';
import { Farm } from '@modules/farms/entities/farm.entity';

export enum UserRoles {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  FARMER = 'farmer',
}

@Entity('users')
@Index('IDX_users_email_unique', ['email'], { unique: true })
@Index('IDX_users_farm_id', ['farmId'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: UserRoles,
    enumName: 'user_roles_enum',
    default: UserRoles.CUSTOMER,
  })
  role: UserRoles;

  @Column({ name: 'farm_id', type: 'uuid', nullable: true })
  farmId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @ManyToOne(() => Farm, (farm) => farm.users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm | null;
}
