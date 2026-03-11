import { Field, Float, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class ProductsFilterInput {
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  farmId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isOrganic?: boolean;

  @Field(() => Float, { nullable: true, description: 'Min price in cents' })
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @Field(() => Float, { nullable: true, description: 'Max price in cents' })
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @Field(() => String, { nullable: true, description: 'Search by name' })
  @IsString()
  @IsOptional()
  search?: string;
}
