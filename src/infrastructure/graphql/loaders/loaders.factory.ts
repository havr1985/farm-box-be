import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { In, Repository } from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import * as DataLoader from 'dataloader';
import { AppLoaders } from '@infrastructure/graphql/loaders/loaders.types';
import { Farm } from '@modules/farms/entities/farm.entity';
import { Category } from '@modules/categories/entities/category.entity';

@Injectable()
export class LoadersFactory {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(): AppLoaders {
    return {
      productLoader: this.createProductLoader(),
      userLoader: this.createUserLoader(),
      farmLoader: this.createFarmLoader(),
      categoryLoader: this.createCategoryLoader(),
    };
  }

  private createProductLoader(): DataLoader<string, Product | null> {
    return new DataLoader<string, Product | null>(async (ids) => {
      if (ids.length === 0) return [];
      const products = await this.productsRepository.find({
        where: { id: In([...ids]) },
      });
      const productsMap = new Map(products.map((p) => [p.id, p]));
      return ids.map((id) => productsMap.get(id) ?? null);
    });
  }

  private createUserLoader(): DataLoader<string, User | null> {
    return new DataLoader<string, User | null>(async (ids) => {
      if (ids.length === 0) return [];
      const users = await this.usersRepository.find({
        where: { id: In([...ids]) },
      });
      const usersMap = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => usersMap.get(id) ?? null);
    });
  }

  private createFarmLoader(): DataLoader<string, Farm | null> {
    return new DataLoader<string, Farm | null>(async (ids) => {
      if (ids.length === 0) return [];
      const farms = await this.farmRepository.find({
        where: { id: In([...ids]) },
      });
      const farmsMap = new Map(farms.map((f) => [f.id, f]));
      return ids.map((id) => farmsMap.get(id) ?? null);
    });
  }

  private createCategoryLoader(): DataLoader<string, Category | null> {
    return new DataLoader<string, Category | null>(async (ids) => {
      if (ids.length === 0) return [];
      const categories = await this.categoryRepository.find({
        where: { id: In([...ids]) },
      });
      const categoriesMap = new Map(categories.map((c) => [c.id, c]));
      return ids.map((id) => categoriesMap.get(id) ?? null);
    });
  }
}
