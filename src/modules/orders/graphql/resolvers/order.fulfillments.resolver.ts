import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderFulfillmentType } from '@modules/orders/graphql/types/order-fulfillment.type';
import { FarmType } from '@modules/farms/graphql/types/farm.type';
import { GraphQLContext } from '@infrastructure/graphql/loaders/loaders.types';

@Resolver(() => OrderFulfillmentType)
export class OrderFulfillmentResolver {
  @ResolveField(() => FarmType, { nullable: true })
  async farm(
    @Parent() fulfillment: OrderFulfillmentType,
    @Context() ctx: GraphQLContext,
  ): Promise<FarmType | null> {
    return ctx.loaders.farmLoader.load(fulfillment.farmId);
  }
}
