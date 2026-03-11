import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from '@modules/orders/graphql/enums/order-status.enum';
import { OrderItemType } from '@modules/orders/graphql/types/order-item.type';
import { FarmType } from '@modules/farms/graphql/types/farm.type';

@ObjectType('OrderFulfillment')
export class OrderFulfillmentType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  farmId: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Int)
  subtotalCents: number;

  @Field(() => [OrderItemType])
  items: OrderItemType[];
}
