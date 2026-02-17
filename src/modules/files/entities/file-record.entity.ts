import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { FileKind } from '@modules/files/constants/file-kinds';
import {
  FileEntityType,
  FileStatus,
  FileVisibility,
} from '@modules/files/constants/file-enums';

@Entity('files')
@Index('IDX_files_owner_id', ['ownerId'])
@Index('IDX_files_entity', ['entityType', 'entityId'])
@Index('IDX_files_object_key', ['objectKey'], { unique: true })
@Index('IDX_files_status', ['fileStatus'])
export class FileRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: FileEntityType,
    enumName: 'file_entity_type_enum',
  })
  entityType: FileEntityType;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ name: 'object_key', type: 'varchar', length: 512 })
  objectKey: string;

  @Column({ name: 'content_type', type: 'varchar', length: 120 })
  contentType: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes: number;

  @Column({
    name: 'file_status',
    type: 'enum',
    enum: FileStatus,
    enumName: 'file_status_enum',
    default: FileStatus.PENDING,
  })
  fileStatus: FileStatus;

  @Column({
    type: 'enum',
    enum: FileVisibility,
    enumName: 'file_visibility_enum',
    default: FileVisibility.PUBLIC,
  })
  visibility: FileVisibility;

  @Column({ type: 'enum', enum: FileKind, enumName: 'file_kind_enum' })
  kind: FileKind;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
