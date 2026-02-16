import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProductType } from '@modules/products/graphql/types/product.type';
import { OrderItemType } from '@modules/orders/graphql/types/order-item.type';
import { GraphQLContext } from '@infrastructure/graphql/loaders/loaders.types';

@Resolver(() => OrderItemType)
export class OrderItemsResolver {
  @ResolveField(() => ProductType, { nullable: true })
  async product(
    @Parent() orderItem: OrderItemType,
    @Context() ctx: GraphQLContext,
  ): Promise<ProductType | null> {
    return ctx.loaders.productLoader.load(orderItem.productId);
  }
}
