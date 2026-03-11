import { ApiProperty } from '@nestjs/swagger';
import {
  FileEntityType,
  FileStatus,
  FileVisibility,
} from '@modules/files/constants/file-enums';
import { FileKind } from '@modules/files/constants/file-kinds';

export class FileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ enum: FileEntityType })
  entityType: FileEntityType;

  @ApiProperty({ nullable: true })
  entityId: string | null;

  @ApiProperty({ enum: FileKind })
  kind: FileKind;

  @ApiProperty({ enum: FileStatus })
  status: FileStatus;

  @ApiProperty({ enum: FileVisibility })
  visibility: FileVisibility;

  @ApiProperty()
  contentType: string;

  @ApiProperty()
  sizeBytes: number;

  @ApiProperty()
  url: string;

  @ApiProperty({ nullable: true })
  completedAt: Date | null;
}
