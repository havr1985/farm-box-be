import { Field, ObjectType } from '@nestjs/graphql';
import { OrderType } from '@modules/orders/graphql/types/order.type';

@ObjectType()
export class OrdersResponseType {
  @Field(() => [OrderType])
  orders: OrderType[];

  @Field(() => String, { nullable: true })
  nextCursor?: string | null;
}
