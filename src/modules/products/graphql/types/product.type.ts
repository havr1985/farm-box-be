import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ProductUnit } from '@modules/products/entities/product.entity';

registerEnumType(ProductUnit, { name: 'productUnit' });

@ObjectType('Product')
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  sku: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Int)
  priceCents: number;

  @Field(() => Int, { nullable: true })
  compareAtPriceCents: number | null;

  @Field(() => Int)
  stock: number;

  @Field(() => ProductUnit)
  unit: ProductUnit;

  @Field(() => Boolean)
  isOrganic: boolean;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  harvestDate: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  expiresAt: Date | null;

  @Field(() => String, { nullable: true })
  mainImageFileId: string | null;

  @Field(() => String)
  farmId: string;

  @Field(() => String, { nullable: true })
  categoryId: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
