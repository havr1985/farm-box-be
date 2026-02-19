import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(data);
    return await this.productsRepository.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['mainImageFile'],
    });
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return await this.productsRepository.find({ where: { id: In(ids) } });
  }

  async save(product: Product): Promise<void> {
    await this.productsRepository.save(product);
  }

  async remove(product: Product): Promise<void> {
    await this.productsRepository.softRemove(product);
  }
}
