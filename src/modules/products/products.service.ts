import { Injectable } from '@nestjs/common';
import { Product } from '@modules/products/entities/product.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@common/exceptions/app.exception';
import { ProductsRepository } from '@modules/products/products.repository';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { UserRole } from '@modules/users/entities/user.entity';
import { FilesService } from '@modules/files/files.service';
import { CreateProductDto } from '@modules/products/dto/create-product.dto';
import { CategoriesService } from '@modules/categories/categories.service';
import { FileRecord } from '@modules/files/entities/file-record.entity';
import { randomUUID } from 'crypto';
import { UpdateProductDto } from '@modules/products/dto/update-product.dto';
import { ProductResponseDto } from '@modules/products/dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly filesService: FilesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    user: AccessTokenPayload,
  ): Promise<ProductResponseDto> {
    const farmId = this.resolveFarmId(createProductDto.farmId, user);
    if (createProductDto.categoryId) {
      await this.categoriesService.findOneById(createProductDto.categoryId);
    }
    let imageFile: FileRecord | null = null;
    if (createProductDto.mainImageFileId) {
      imageFile = await this.filesService.getReadyFileForAttach(
        createProductDto.mainImageFileId,
        user.sub,
      );
    }
    const sku = createProductDto.sku ?? this.generateSku();
    const product = await this.productsRepository.create({
      ...createProductDto,
      farmId,
      sku,
      mainImageFileId: imageFile?.id ?? null,
    });
    if (imageFile) {
      await this.filesService.attachToEntity(imageFile, product.id);
    }
    return this.toResponse(product);
  }

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

  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    user: AccessTokenPayload,
  ): Promise<ProductResponseDto> {
    const product = await this.findById(productId);
    this.assertFarmOwnership(product, user);
    if (updateProductDto.categoryId) {
      await this.categoriesService.findOneById(updateProductDto.categoryId);
    }
    if (updateProductDto.mainImageFileId) {
      const file = await this.filesService.getReadyFileForAttach(
        updateProductDto.mainImageFileId,
        user.sub,
      );
      await this.filesService.attachToEntity(file, product.id);
    }
    Object.assign(product, updateProductDto);
    await this.productsRepository.save(product);
    return this.toResponse(product);
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

  async softDeleteProduct(
    productId: string,
    user: AccessTokenPayload,
  ): Promise<void> {
    const product = await this.findById(productId);
    this.assertFarmOwnership(product, user);
    await this.productsRepository.remove(product);
  }

  private resolveFarmId(
    farmId: string | undefined,
    user: AccessTokenPayload,
  ): string {
    if (user.roles.includes(UserRole.ADMIN)) {
      if (!farmId) {
        throw new BadRequestException('Admin must specify farmId');
      }
      return farmId;
    }
    if (!user.farmId) {
      throw new BadRequestException('You are not assigned to any farm');
    }
    return user.farmId;
  }

  private generateSku(): string {
    return `PRD-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  private assertFarmOwnership(
    product: Product,
    user: AccessTokenPayload,
  ): void {
    if (user.roles.includes(UserRole.ADMIN)) return;
    if (product.farmId !== user.farmId) {
      throw new ForbiddenException(
        'You can only manage products of your own farm',
      );
    }
  }

  private async toResponse(product: Product): Promise<ProductResponseDto> {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      priceCents: product.priceCents,
      compareAtPriceCents: product.compareAtPriceCents,
      stock: product.stock,
      unit: product.unit,
      isOrganic: product.isOrganic,
      isActive: product.isActive,
      harvestDate: product.harvestDate,
      expiresAt: product.expiresAt,
      farmId: product.farmId,
      categoryId: product.categoryId,
      mainImageFileId: product.mainImageFileId,
      imageUrl: product.mainImageFile
        ? await this.filesService.buildFileUrl(product.mainImageFile.objectKey)
        : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
