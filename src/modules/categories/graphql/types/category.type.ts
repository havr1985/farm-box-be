import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Category')
export class CategoryType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}
