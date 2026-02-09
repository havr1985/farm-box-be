import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';
import { OrderStatus } from '@modules/orders/graphql/enums/order-status.enum';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

@InputType()
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dateTo?: Date;
}
