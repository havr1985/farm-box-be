import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductsService } from '@modules/products/products.service';
import { AttachFileDto } from '@modules/files/dto/attach-file.dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';
import { RequiredPermission } from '@modules/auth/decorators/require-permission.decorator';
import { CreateProductDto } from '@modules/products/dto/create-product.dto';
import { UpdateProductDto } from '@modules/products/dto/update-product.dto';
import { ProductResponseDto } from '@modules/products/dto/product-response.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.FARMER, UserRole.ADMIN)
  @RequiredPermission('products:create:own')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<ProductResponseDto> {
    return this.productsService.createProduct(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.FARMER, UserRole.ADMIN)
  @RequiredPermission('products:update:own')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateProduct(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.FARMER, UserRole.ADMIN)
  @RequiredPermission('products:delete:own')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiResponse({ status: 204 })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<void> {
    return this.productsService.softDeleteProduct(id, user);
  }

  @Post(':productId/images')
  @Roles(UserRole.FARMER, UserRole.ADMIN)
  @RequiredPermission('products:images:attach:own')
  @ApiOperation({ summary: 'Set main product image' })
  @ApiResponse({ status: 200, description: 'Image attached' })
  async setMainImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AttachFileDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.productsService.setMainImage(productId, dto.fileId, user);
  }
}
