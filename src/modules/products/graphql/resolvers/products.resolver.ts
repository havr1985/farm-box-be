import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ProductType } from '@modules/products/graphql/types/product.type';
import { ProductsService } from '@modules/products/products.service';
import { ProductsResponseType } from '@modules/products/graphql/types/products-response.type';
import { ProductsFilterInput } from '@modules/products/graphql/inputs/products-filter.input';
import { ProductsPaginationInput } from '@modules/products/graphql/inputs/products-pagination.input';
import { FarmType } from '@modules/farms/graphql/types/farm.type';
import { GraphQLContext } from '@infrastructure/graphql/loaders/loaders.types';
import { CategoryType } from '@modules/categories/graphql/types/category.type';
import { Product } from '@modules/products/entities/product.entity';
import { FilesService } from '@modules/files/files.service';
import { Public } from '@modules/auth/decorators/public.decorator';

@Resolver(() => ProductType)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly filesService: FilesService,
  ) {}

  @Query(() => ProductsResponseType, { name: 'products' })
  @Public()
  async getProducts(
    @Args('filter', { nullable: true }) filter?: ProductsFilterInput,
    @Args('pagination', { nullable: true })
    pagination?: ProductsPaginationInput,
  ): Promise<ProductsResponseType> {
    return this.productsService.findAll(filter, pagination);
  }

  @Query(() => ProductType, { name: 'product' })
  @Public()
  async getOneProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProductType> {
    return this.productsService.findById(id);
  }

  @ResolveField(() => FarmType)
  async farm(
    @Parent() product: ProductType,
    @Context() ctx: GraphQLContext,
  ): Promise<FarmType | null> {
    return ctx.loaders.farmLoader.load(product.farmId);
  }

  @ResolveField(() => CategoryType, { nullable: true })
  async category(
    @Parent() product: ProductType,
    @Context() ctx: GraphQLContext,
  ): Promise<CategoryType | null> {
    return product.categoryId
      ? ctx.loaders.categoryLoader.load(product.categoryId)
      : null;
  }

  @ResolveField(() => String, { nullable: true })
  async imageUrl(@Parent() product: Product) {
    if (!product.mainImageFile) return null;
    return this.filesService.buildFileUrl(product.mainImageFile.objectKey);
  }
}
