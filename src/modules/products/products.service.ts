import { Injectable } from '@nestjs/common';
import { Product } from '@modules/products/entities/product.entity';
import {
  ForbiddenException,
  NotFoundException,
} from '@common/exceptions/app.exception';
import { ProductsRepository } from '@modules/products/products.repository';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { UserRole } from '@modules/users/entities/user.entity';
import { FilesService } from '@modules/files/files.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly filesService: FilesService,
  ) {}

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product', id);
    }
    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return await this.productsRepository.findByIds(ids);
  }

  async setMainImage(
    productId: string,
    fileId: string,
    user: AccessTokenPayload,
  ) {
    const product = await this.findById(productId);
    if (
      !user.roles.includes(UserRole.ADMIN) &&
      product.farmId !== user.farmId
    ) {
      throw new ForbiddenException(
        'You can only attach images to your own farm products',
      );
    }

    const file = await this.filesService.getReadyFileForAttach(
      fileId,
      user.sub,
    );
    await this.filesService.attachToEntity(file, productId);
    product.mainImageFileId = file.id;
    await this.productsRepository.save(product);
    const imageUrl = await this.filesService.buildFileUrl(file.objectKey);

    return {
      productId: product.id,
      mainImageFileId: file.id,
      imageUrl,
    };
  }
}
