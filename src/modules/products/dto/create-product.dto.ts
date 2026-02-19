import { ProductUnit } from '@modules/products/entities/product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farmId?: string;

  @ApiProperty({ example: "Молоко коров'яче 3.2%" })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Свіже непастеризоване молоко' })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 4500, description: 'Price in cents' })
  @IsInt()
  @Min(0)
  priceCents: number;

  @ApiPropertyOptional({
    example: 5500,
    description: 'Compare at price in cents',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  compareAtPriceCents?: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ enum: ProductUnit, example: ProductUnit.KG })
  @IsEnum(ProductUnit)
  unit: ProductUnit;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isOrganic?: boolean;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsDateString()
  @IsOptional()
  harvestDate?: Date;

  @ApiPropertyOptional({ example: '2026-03-15' })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'SUN-MILK-32' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: 'Attach ready file as main image' })
  @IsUUID()
  @IsOptional()
  mainImageFileId?: string;
}
