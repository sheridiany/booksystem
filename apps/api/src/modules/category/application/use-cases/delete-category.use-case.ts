import { Injectable, Inject, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import { Prisma } from '@prisma/client';

/**
 * 删除分类用例
 *
 * 职责:
 * - 验证分类存在性
 * - 验证分类没有子分类
 * - 验证分类下没有图书
 * - 删除分类
 */
@Injectable()
export class DeleteCategoryUseCase {
  private readonly logger = new Logger(DeleteCategoryUseCase.name);

  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`开始删除分类: ${id}`);

    // 1. 验证分类存在
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`分类不存在: ${id}`);
    }
    this.logger.log(`分类存在: ${category.name}`);

    // 2. 检查是否有子分类
    const hasChildren = await this.categoryRepository.hasChildren(id);
    this.logger.log(`子分类检查结果: ${hasChildren}`);
    if (hasChildren) {
      throw new BadRequestException('该分类下有子分类,无法删除');
    }

    // 3. 删除分类 (捕获外键约束错误)
    try {
      this.logger.log(`准备删除分类: ${id}`);
      await this.categoryRepository.delete(id);
      this.logger.log(`分类删除成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除分类时发生错误: ${id}`, error);

      // Prisma 外键约束错误
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Prisma错误码: ${error.code}`);
        if (error.code === 'P2003') {
          // 外键约束失败 - 分类下还有图书
          throw new BadRequestException('该分类下还有图书,无法删除。请先删除或移动分类下的图书。');
        }
        if (error.code === 'P2025') {
          // 记录不存在
          throw new NotFoundException(`分类不存在: ${id}`);
        }
      }
      // 其他未知错误
      throw new InternalServerErrorException('删除分类失败,请稍后重试');
    }
  }
}
