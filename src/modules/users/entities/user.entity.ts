import { BaseEntity } from '@common/entities/base.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Order } from '@modules/orders/entities/order.entity';

export enum UserRoles {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

@Entity('users')
@Index('IDX_users_email_unique', ['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enumName: 'user_roles_enum',
    default: UserRoles.CUSTOMER,
  })
  role: UserRoles;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
