import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { OrderType } from '@modules/orders/graphql/types/order.type';
import { OrdersService } from '@modules/orders/orders.service';
import { OrdersResponseType } from '@modules/orders/graphql/types/orders-response.type';
import { OrdersFilterInput } from '@modules/orders/graphql/inputs/orders-filter.input';
import { OrdersPaginationInput } from '@modules/orders/graphql/inputs/orders-pagination.input';
import { UserType } from '@modules/users/graphql/user.type';
import { GraphQLContext } from '@infrastructure/graphql/loaders/loaders.types';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { RequiredPermission } from '@modules/auth/decorators/require-permission.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => OrdersResponseType, { name: 'userOrders' })
  @RequiredPermission('orders:read:own')
  async getOrders(
    @CurrentUser() user: AccessTokenPayload,
    @Args('filter', { nullable: true }) filter?: OrdersFilterInput,
    @Args('pagination', { nullable: true }) pagination?: OrdersPaginationInput,
  ): Promise<OrdersResponseType> {
    return this.ordersService.findByUser(
      user.sub,
      pagination?.cursor,
      pagination?.limit ?? 20,
      filter,
    );
  }

  @Query(() => OrdersResponseType, { name: 'adminUserOrders' })
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @RequiredPermission('orders:read:any')
  async getOrdersByUserId(
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
  @RequiredPermission('orders:read:own')
  async getOrder(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<OrderType | null> {
    return this.ordersService.findOne(id, user);
  }

  @ResolveField(() => UserType, { nullable: true })
  async user(
    @Parent() order: OrderType,
    @Context() ctx: GraphQLContext,
  ): Promise<UserType | null> {
    return ctx.loaders.userLoader.load(order.userId);
  }
}
