import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { OrdersService } from '@modules/orders/orders.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';
import { OrderResponseDto } from '@modules/orders/dto/order-response.dto';

@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates an order transactionally with stock validation and idempotency protection. ' +
      'If the same idempotencyKey is sent again, the existing order is returned.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Duplicate request — existing order returned (idempotency)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Insufficient stock',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order canceled successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Order cannot be canceled (invalid status)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async cancelOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
