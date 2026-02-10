import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { OrderType } from '@modules/orders/graphql/types/order.type';
import { OrdersService } from '@modules/orders/orders.service';
import { OrdersResponseType } from '@modules/orders/graphql/types/orders-response.type';
import { OrdersFilterInput } from '@modules/orders/graphql/inputs/orders-filter.input';
import { OrdersPaginationInput } from '@modules/orders/graphql/inputs/orders-pagination.input';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => OrdersResponseType, { name: 'orders' })
  async getOrders(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('filter', { nullable: true }) filter?: OrdersFilterInput,
    @Args('pagination', { nullable: true }) pagination?: OrdersPaginationInput,
  ): Promise<OrdersResponseType> {
    return this.ordersService.findByUser(
      userId,
      pagination?.cursor,
      pagination?.limit ?? 20,
      filter,
    );
  }

  @Query(() => OrderType, { name: 'order', nullable: true })
  async getOrder(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<OrderType | null> {
    return this.ordersService.findOne(id);
  }
}
