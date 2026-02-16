import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProductType } from '@modules/products/graphql/types/product.type';

@ObjectType('OrderItem')
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  priceCentsSnapshot: number;

  @Field()
  productNameSnapshot: string;

  @Field()
  farmNameSnapshot: string;

  @Field(() => ProductType, { nullable: true })
  product?: ProductType;
}
