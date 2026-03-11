import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { OrdersService } from '@modules/orders/orders.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';
import { OrderResponseDto } from '@modules/orders/dto/order-response.dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';
import { RequiredPermission } from '@modules/auth/decorators/require-permission.decorator';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { UpdateFulfillmentStatusDto } from '@modules/orders/dto/update-fulfillment-status.dto';

@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @RequiredPermission('orders:create')
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
    @CurrentUser('sub') userId: string,
    @Body()
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Post(':id/cancel')
  @RequiredPermission('orders:cancel:own')
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
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.ordersService.cancelOrder(id, user);
  }

  @Patch(':orderId/fulfillments/:fulfillmentId/status')
  @Roles(UserRole.FARMER, UserRole.ADMIN)
  @RequiredPermission('orders:update:own')
  @ApiOperation({ summary: 'Update fulfillment status' })
  async updateFulfillmentStatus(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('fulfillmentId', ParseUUIDPipe) fulfillmentId: string,
    @Body() dto: UpdateFulfillmentStatusDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateFulfilmentStatus(
      orderId,
      fulfillmentId,
      dto.status,
      user,
    );
  }
}
