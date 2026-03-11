import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { ProductsRepository } from '@modules/products/products.repository';
import { FilesModule } from '@modules/files/files.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { ProductsResolver } from '@modules/products/graphql/resolvers/products.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), FilesModule, CategoriesModule],
  providers: [ProductsService, ProductsRepository, ProductsResolver],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
