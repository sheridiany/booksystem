import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { CreateCategoryDto, UpdateCategoryDto, CategoryDto } from '../../application/dto/category.dto';
import { Public } from '../../../../shared/decorators/public.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/entities/user.entity';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

/**
 * 分类管理控制器
 *
 * 路由: /api/v1/categories
 *
 * 权限说明:
 * - 查询接口: 公开访问（读者端需要）
 * - 管理接口: 仅管理员
 */
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 创建分类
   * POST /api/v1/categories
   * 权限: 仅管理员
   */
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    const category = await this.createCategoryUseCase.execute(dto);
    return CategoryDto.fromEntity(category);
  }

  /**
   * 获取所有分类（包含图书数量统计）
   * GET /api/v1/categories
   * 权限: 公开访问
   */
  @Public()
  @Get()
  async findAll(@Query('parentId') parentId?: string): Promise<CategoryDto[]> {
    let categories;

    if (parentId === 'root') {
      // 获取根分类
      categories = await this.getCategoriesUseCase.getRootCategories();
    } else if (parentId) {
      // 获取指定父分类的子分类
      categories = await this.getCategoriesUseCase.getChildCategories(parentId);
    } else {
      // 获取所有分类
      categories = await this.getCategoriesUseCase.execute();
    }

    // 统计每个分类的图书数量
    const categoryIds = categories.map((c) => c.id);
    const bookCounts = await this.prisma.book.groupBy({
      by: ['categoryId'],
      where: {
        categoryId: { in: categoryIds },
      },
      _count: {
        id: true,
      },
    });

    // 创建 categoryId -> bookCount 的映射
    const countMap = new Map<string, number>();
    bookCounts.forEach((item) => {
      countMap.set(item.categoryId, item._count.id);
    });

    // 返回带有图书数量的分类 DTO
    return categories.map((c) => CategoryDto.fromEntity(c, countMap.get(c.id) || 0));
  }

  /**
   * 更新分类
   * PUT /api/v1/categories/:id
   * 权限: 仅管理员
   */
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    const category = await this.updateCategoryUseCase.execute(id, dto);
    return CategoryDto.fromEntity(category);
  }

  /**
   * 删除分类
   * DELETE /api/v1/categories/:id
   * 权限: 仅管理员
   */
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.deleteCategoryUseCase.execute(id);
      return { message: '分类删除成功' };
    } catch (error) {
      console.error('CategoryController.delete error:', error);
      throw error;
    }
  }
}
