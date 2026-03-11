import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { OrderStatus } from '@modules/orders/graphql/enums/order-status.enum';
import { UserType } from '@modules/users/graphql/user.type';
import { OrderFulfillmentType } from '@modules/orders/graphql/types/order-fulfillment.type';

@ObjectType('Order')
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Int)
  totalCents: number;

  @Field(() => [OrderFulfillmentType])
  fulfillments: OrderFulfillmentType[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
