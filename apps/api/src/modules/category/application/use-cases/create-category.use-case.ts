import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CreateCategoryDto } from '../dto/category.dto';

/**
 * 创建分类用例
 *
 * 职责:
 * - 验证分类名称唯一性
 * - 验证父分类存在性
 * - 创建分类实体
 */
@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    // 1. 检查分类名称是否已存在
    const nameExists = await this.categoryRepository.existsByName(dto.name);
    if (nameExists) {
      throw new ConflictException(`分类名称已存在: ${dto.name}`);
    }

    // 2. 如果有父分类,验证父分类是否存在
    if (dto.parentId) {
      const parentCategory = await this.categoryRepository.findById(dto.parentId);
      if (!parentCategory) {
        throw new NotFoundException(`父分类不存在: ${dto.parentId}`);
      }
    }

    // 3. 创建分类实体
    const category = new Category({
      id: uuidv4(),
      name: dto.name,
      parentId: dto.parentId ?? null,
      sort: dto.sort ?? 0,
    });

    // 4. 保存分类
    return await this.categoryRepository.save(category);
  }
}
