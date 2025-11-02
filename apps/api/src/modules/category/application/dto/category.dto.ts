import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Category } from '../../domain/entities/category.entity';

/**
 * 创建分类 DTO
 */
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: '分类名称不能为空' })
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;
}

/**
 * 更新分类 DTO
 */
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '分类名称不能为空' })
  name?: string;

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;
}

/**
 * 分类响应 DTO
 */
export class CategoryDto {
  id: string;
  name: string;
  parentId: string | null;
  sort: number;
  createdAt: string;
  updatedAt: string;

  /**
   * 从领域实体转换为 DTO
   */
  static fromEntity(category: Category): CategoryDto {
    const dto = new CategoryDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.parentId = category.parentId;
    dto.sort = category.sort;
    dto.createdAt = category.createdAt.toISOString();
    dto.updatedAt = category.updatedAt.toISOString();
    return dto;
  }
}
