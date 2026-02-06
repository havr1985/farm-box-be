import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@modules/orders/entities/order.entity';

export class OrderItemResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  productId: string;

  @ApiProperty({ example: "Молоко коров'яче 3.2%" })
  productNameSnapshot: string;

  @ApiProperty({ example: 'Еко-ферма Сонячна' })
  farmNameSnapshot: string;

  @ApiProperty({ example: 4500 })
  priceCentsSnapshot: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 9000 })
  lineTotalCents: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: '7c9e6679-7425-40de-944b-e07fc1f90ae7' })
  idempotencyKey: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: 18000 })
  totalCents: number;

  @ApiProperty({ example: 0 })
  discountCents: number;

  @ApiProperty({ example: 0 })
  deliveryCents: number;

  @ApiProperty({ example: 18000 })
  finalCents: number;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  createdAt: Date;
}
