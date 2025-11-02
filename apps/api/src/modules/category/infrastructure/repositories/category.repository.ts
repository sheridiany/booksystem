import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';

/**
 * 分类仓储实现 (Prisma)
 */
@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(category: Category): Promise<Category> {
    const data = {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      sort: category.sort,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    // openGauss 不支持 upsert,使用 findUnique + create/update
    const existing = await this.prisma.category.findUnique({
      where: { id: category.id },
    });

    const saved = existing
      ? await this.prisma.category.update({
          where: { id: category.id },
          data,
        })
      : await this.prisma.category.create({ data });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    return category ? this.toDomain(category) : null;
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
    });

    return categories.map((c) => this.toDomain(c));
  }

  async findByParentId(parentId: string | null): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
    });

    return categories.map((c) => this.toDomain(c));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: {
        name,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return count > 0;
  }

  async hasChildren(id: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { parentId: id },
    });

    return count > 0;
  }

  /**
   * Prisma 模型转领域实体
   */
  private toDomain(prismaCategory: any): Category {
    return new Category({
      id: prismaCategory.id,
      name: prismaCategory.name,
      parentId: prismaCategory.parentId,
      sort: prismaCategory.sort,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    });
  }
}
