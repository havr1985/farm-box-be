import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductUnit } from '@modules/products/entities/product.entity';

export class ProductResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: "Молоко коров'яче 3.2%" })
  name: string;

  @ApiPropertyOptional({ example: 'Свіже непастеризоване молоко' })
  description: string | null;

  @ApiProperty({ example: 'SUN-MILK-32' })
  sku: string;

  @ApiProperty({ example: 4500 })
  priceCents: number;

  @ApiPropertyOptional({ example: 5500 })
  compareAtPriceCents: number | null;

  @ApiProperty({ example: 50 })
  stock: number;

  @ApiProperty({ enum: ProductUnit, example: ProductUnit.KG })
  unit: ProductUnit;

  @ApiProperty({ example: true })
  isOrganic: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2026-03-01' })
  harvestDate: Date | null;

  @ApiPropertyOptional({ example: '2026-03-15' })
  expiresAt: Date | null;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  farmId: string;

  @ApiPropertyOptional()
  categoryId: string | null;

  @ApiPropertyOptional()
  mainImageFileId: string | null;

  @ApiPropertyOptional({ example: 'http://localhost:9000/...' })
  imageUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
