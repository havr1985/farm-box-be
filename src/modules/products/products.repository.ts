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

  async findAll(
    filter: {
      categoryId?: string;
      farmId?: string;
      isOrganic?: boolean;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    },
    page: number,
    limit: number,
  ): Promise<{ items: Product[]; totalCount: number }> {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.mainImageFile', 'mainImageFile')
      .where('product.isActive = :isActive', { isActive: true });

    if (filter.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: filter.categoryId,
      });
    }
    if (filter.farmId) {
      qb.andWhere('product.farmId = :farmId', { farmId: filter.farmId });
    }
    if (filter.isOrganic !== undefined) {
      qb.andWhere('product.isOrganic = :isOrganic', {
        isOrganic: filter.isOrganic,
      });
    }
    if (filter.minPrice !== undefined) {
      qb.andWhere('product.priceCents >= :minPrice', {
        minPrice: filter.minPrice,
      });
    }
    if (filter.maxPrice !== undefined) {
      qb.andWhere('product.priceCents <= :maxPrice', {
        maxPrice: filter.maxPrice,
      });
    }
    if (filter.search) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${filter.search}%`,
      });
    }
    const skip = (page - 1) * limit;
    const [items, totalCount] = await qb
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, totalCount };
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
