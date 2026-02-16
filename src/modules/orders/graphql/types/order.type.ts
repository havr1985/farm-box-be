import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { OrderStatus } from '@modules/orders/graphql/enums/order-status.enum';
import { OrderItemType } from '@modules/orders/graphql/types/order-item.type';
import { UserType } from '@modules/users/graphql/user.type';

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

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
