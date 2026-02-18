import { ApiProperty } from '@nestjs/swagger';

export class PresignResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  fileId: string;

  @ApiProperty({ example: 'products/user-uuid/images/file-uuid.jpg' })
  objectKey: string;

  @ApiProperty({ example: 'https://localhost:9000/farmbox-files-private/...' })
  uploadUrl: string;

  @ApiProperty({ example: 'PUT' })
  uploadMethod: string;

  @ApiProperty({ example: { 'Content-Type': 'image/jpeg' } })
  uploadHeaders: Record<string, string>;

  @ApiProperty({ example: 900 })
  expiresInSec: number;
}
