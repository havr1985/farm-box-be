import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@modules/orders/enums/order-status.enum';
import { IsEnum } from 'class-validator';

export class UpdateFulfillmentStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
