import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';

/**
 * 删除分类用例
 *
 * 职责:
 * - 验证分类存在性
 * - 验证分类没有子分类
 * - 删除分类
 */
@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. 验证分类存在
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`分类不存在: ${id}`);
    }

    // 2. 检查是否有子分类
    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestException('该分类下有子分类,无法删除');
    }

    // 3. 删除分类
    await this.categoryRepository.delete(id);
  }
}
