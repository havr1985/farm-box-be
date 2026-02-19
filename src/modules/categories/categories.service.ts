import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '@modules/categories/categories.repository';
import { Category } from '@modules/categories/entities/category.entity';
import { NotFoundException } from '@common/exceptions/app.exception';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findOneById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category', id);
    }
    return category;
  }
}
