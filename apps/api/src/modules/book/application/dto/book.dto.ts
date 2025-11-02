import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Book } from '../../domain/entities/book.entity';

/**
 * 创建图书 DTO
 *
 * 职责变更：仅创建图书元信息
 * 库存管理已移至 BookCopy（通过 CreateBookCopyDto）
 */
export class CreateBookDto {
  @IsOptional()
  @IsString()
  isbn?: string | null; // 改为可选：电子资源可能无 ISBN

  @IsString()
  @IsNotEmpty({ message: '图书标题不能为空' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '作者不能为空' })
  author: string;

  @IsString()
  @IsNotEmpty({ message: '出版社不能为空' })
  publisher: string;

  @IsString()
  @IsNotEmpty({ message: '分类 ID 不能为空' })
  categoryId: string;

  @IsOptional()
  @IsString()
  coverFileId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  publishDate?: string;
}

/**
 * 更新图书 DTO
 */
export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '图书标题不能为空' })
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '作者不能为空' })
  author?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '出版社不能为空' })
  publisher?: string;

  @IsOptional()
  @IsString()
  isbn?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '分类 ID 不能为空' })
  categoryId?: string;

  @IsOptional()
  @IsString()
  coverFileId?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsDateString()
  publishDate?: string | null;
}

/**
 * 图书查询 DTO
 */
export class QueryBooksDto {
  @IsOptional()
  @Type(() => Number) // 将字符串转换为数字
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number) // 将字符串转换为数字
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string; // 搜索标题、作者、ISBN
}

/**
 * 图书响应 DTO
 *
 * 职责变更：仅返回图书元信息
 * 载体信息（库存等）通过 BookCopyDto 返回
 */
export class BookDto {
  id!: string;
  isbn!: string | null;
  title!: string;
  author!: string;
  publisher!: string;
  categoryId!: string;
  coverFileId!: string | null;
  description!: string | null;
  publishDate!: string | null;
  createdAt!: string;
  updatedAt!: string;

  // 可选：关联的载体信息（通过 join 查询时）
  copies?: any[]; // BookCopyDto[]

  /**
   * 从领域实体转换为 DTO
   */
  static fromEntity(book: Book): BookDto {
    const dto = new BookDto();
    dto.id = book.id;
    dto.isbn = book.isbn;
    dto.title = book.title;
    dto.author = book.author;
    dto.publisher = book.publisher;
    dto.categoryId = book.categoryId;
    dto.coverFileId = book.coverFileId;
    dto.description = book.description;
    dto.publishDate = book.publishDate?.toISOString() || null;
    dto.createdAt = book.createdAt.toISOString();
    dto.updatedAt = book.updatedAt.toISOString();

    return dto;
  }
}

/**
 * 分页图书响应 DTO
 */
export class PaginatedBooksDto {
  items!: BookDto[];
  total!: number;
  page!: number;
  pageSize!: number;
  totalPages!: number;
}
