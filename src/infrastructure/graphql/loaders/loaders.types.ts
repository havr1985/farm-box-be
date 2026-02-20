import DataLoader from 'dataloader';
import { Product } from '@modules/products/entities/product.entity';
import { User } from '@modules/users/entities/user.entity';
import { Request } from 'express';
import { Farm } from '@modules/farms/entities/farm.entity';
import { Category } from '@modules/categories/entities/category.entity';

export interface AppLoaders {
  productLoader: DataLoader<string, Product | null>;
  userLoader: DataLoader<string, User | null>;
  farmLoader: DataLoader<string, Farm | null>;
  categoryLoader: DataLoader<string, Category | null>;
}

export interface GraphQLContext {
  req: Request;
  loaders: AppLoaders;
}
