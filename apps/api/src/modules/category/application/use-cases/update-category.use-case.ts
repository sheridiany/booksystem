import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { UpdateCategoryDto } from '../dto/category.dto';

/**
 * 更新分类用例
 */
@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateCategoryDto): Promise<Category> {
    // 1. 查找分类
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`分类不存在: ${id}`);
    }

    // 2. 更新名称 (如果提供)
    if (dto.name !== undefined) {
      // 检查名称唯一性
      const nameExists = await this.categoryRepository.existsByName(dto.name, id);
      if (nameExists) {
        throw new ConflictException(`分类名称已存在: ${dto.name}`);
      }
      category.updateName(dto.name);
    }

    // 3. 更新父分类 (如果提供)
    if (dto.parentId !== undefined) {
      if (dto.parentId !== null) {
        // 验证父分类存在
        const parentCategory = await this.categoryRepository.findById(dto.parentId);
        if (!parentCategory) {
          throw new NotFoundException(`父分类不存在: ${dto.parentId}`);
        }
      }
      category.updateParent(dto.parentId);
    }

    // 4. 更新排序 (如果提供)
    if (dto.sort !== undefined) {
      category.updateSort(dto.sort);
    }

    // 5. 保存更新
    return await this.categoryRepository.save(category);
  }
}
