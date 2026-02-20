import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Product } from '@modules/products/entities/product.entity';
import { LoadersFactory } from '@infrastructure/graphql/loaders/loaders.factory';
import { Farm } from '@modules/farms/entities/farm.entity';
import { Category } from '@modules/categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, Farm, Category])],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule {}
