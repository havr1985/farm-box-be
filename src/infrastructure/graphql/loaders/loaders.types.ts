import DataLoader from 'dataloader';
import { Product } from '@modules/products/entities/product.entity';
import { User } from '@modules/users/entities/user.entity';

export interface AppLoaders {
  productLoader: DataLoader<string, Product | null>;
  userLoader: DataLoader<string, User | null>;
}

export interface GraphQLContext {
  loaders: AppLoaders;
}
