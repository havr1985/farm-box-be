import { FileEntityType } from '@modules/files/constants/file-enums';
import { FileKind } from '@modules/files/constants/file-kinds';
import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PresignFileDto {
  @ApiProperty({ enum: FileEntityType, example: FileEntityType.PRODUCT })
  @IsEnum(FileEntityType)
  entityType: FileEntityType;

  @ApiProperty({ enum: FileKind, example: FileKind.IMAGE })
  @IsEnum(FileKind)
  kind: FileKind;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  contentType: string;

  @ApiProperty({ example: 2_500_000, description: 'File size in bytes' })
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  sizeBytes: number;
}
