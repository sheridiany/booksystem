import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { CreateCategoryDto, UpdateCategoryDto, CategoryDto } from '../../application/dto/category.dto';

/**
 * 分类管理控制器
 *
 * 路由: /api/v1/categories
 */
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
  ) {}

  /**
   * 创建分类
   * POST /api/v1/categories
   */
  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    const category = await this.createCategoryUseCase.execute(dto);
    return CategoryDto.fromEntity(category);
  }

  /**
   * 获取所有分类
   * GET /api/v1/categories
   */
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

    return categories.map((c) => CategoryDto.fromEntity(c));
  }

  /**
   * 更新分类
   * PUT /api/v1/categories/:id
   */
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
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.deleteCategoryUseCase.execute(id);
    return { message: '分类删除成功' };
  }
}
