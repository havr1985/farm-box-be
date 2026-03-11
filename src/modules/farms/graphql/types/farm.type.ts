import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Farm')
export class FarmType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String)
  location: string;

  @Field(() => Number, { nullable: true })
  rating: number | null;
}
