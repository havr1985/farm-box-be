import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType('Product')
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  priceCents: number;

  @Field(() => Int)
  stock: number;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
