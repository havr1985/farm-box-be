import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Product } from '@modules/products/entities/product.entity';
import { LoadersFactory } from '@infrastructure/graphql/loaders/loaders.factory';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule {}
