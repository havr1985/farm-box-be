import { Injectable } from '@nestjs/common';
import { Product } from '@modules/products/entities/product.entity';
import { NotFoundException } from '@common/exceptions/app.exception';
import { ProductsRepository } from '@modules/products/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

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
}
