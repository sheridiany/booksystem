import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';

/**
 * 获取分类列表用例
 */
@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  /**
   * 获取所有分类
   */
  async execute(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }

  /**
   * 获取根分类
   */
  async getRootCategories(): Promise<Category[]> {
    return await this.categoryRepository.findByParentId(null);
  }

  /**
   * 获取子分类
   */
  async getChildCategories(parentId: string): Promise<Category[]> {
    return await this.categoryRepository.findByParentId(parentId);
  }
}
