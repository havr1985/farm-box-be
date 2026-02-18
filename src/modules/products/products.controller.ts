import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
