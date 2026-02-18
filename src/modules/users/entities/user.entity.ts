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
import { FileRecord } from '@modules/files/entities/file-record.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  FARMER = 'farmer',
  PENDING_FARMER = 'pending_farmer',
  SUPPORT = 'support',
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
    enum: UserRole,
    enumName: 'user_roles_enum',
    array: true,
    default: `{${UserRole.CUSTOMER}}`,
  })
  roles: UserRole[];

  @Column({ name: 'farm_id', type: 'uuid', nullable: true })
  farmId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'avatar_file_id', type: 'uuid', nullable: true })
  avatarFileId: string | null;

  @ManyToOne(() => FileRecord, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avatar_file_id' })
  avatarFile: FileRecord | null;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @ManyToOne(() => Farm, (farm) => farm.users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm | null;

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  get isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  get isFarmer(): boolean {
    return this.hasRole(UserRole.FARMER);
  }

  get isSupport(): boolean {
    return this.hasRole(UserRole.SUPPORT);
  }
}
