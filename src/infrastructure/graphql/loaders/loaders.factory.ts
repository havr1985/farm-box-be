import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { In, Repository } from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import * as DataLoader from 'dataloader';
import { AppLoaders } from '@infrastructure/graphql/loaders/loaders.types';

@Injectable()
export class LoadersFactory {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(): AppLoaders {
    return {
      productLoader: this.createProductLoader(),
      userLoader: this.createUserLoader(),
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
}
