import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ProductType } from '@modules/products/graphql/types/product.type';

@ObjectType()
export class ProductsResponseType {
  @Field(() => [ProductType])
  items: ProductType[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;
}
