import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { Book } from '../../domain/entities/book.entity';

/**
 * 创建图书 DTO
 */
export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'ISBN 不能为空' })
  isbn: string;

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

  @IsNumber()
  @Min(0, { message: '总库存不能为负数' })
  totalCopies: number;

  @IsOptional()
  @IsString()
  coverFileId?: string;

  @IsOptional()
  @IsString()
  contentFileId?: string;

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
  @IsNotEmpty({ message: '分类 ID 不能为空' })
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: '总库存不能为负数' })
  totalCopies?: number;

  @IsOptional()
  @IsString()
  coverFileId?: string | null;

  @IsOptional()
  @IsString()
  contentFileId?: string | null;

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
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
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
 */
export class BookDto {
  id!: string;
  isbn!: string;
  title!: string;
  author!: string;
  publisher!: string;
  categoryId!: string;
  totalCopies!: number;
  availableCopies!: number;
  coverFileId!: string | null;
  contentFileId!: string | null;
  description!: string | null;
  publishDate!: string | null;
  createdAt!: string;
  updatedAt!: string;

  // 计算属性
  borrowedCount?: number;
  borrowRate?: number;
  hasAvailableCopies?: boolean;

  /**
   * 从领域实体转换为 DTO
   */
  static fromEntity(book: Book, includeStats = false): BookDto {
    const dto = new BookDto();
    dto.id = book.id;
    dto.isbn = book.isbn;
    dto.title = book.title;
    dto.author = book.author;
    dto.publisher = book.publisher;
    dto.categoryId = book.categoryId;
    dto.totalCopies = book.totalCopies;
    dto.availableCopies = book.availableCopies;
    dto.coverFileId = book.coverFileId;
    dto.contentFileId = book.contentFileId;
    dto.description = book.description;
    dto.publishDate = book.publishDate?.toISOString() || null;
    dto.createdAt = book.createdAt.toISOString();
    dto.updatedAt = book.updatedAt.toISOString();

    // 可选：包含统计信息
    if (includeStats) {
      dto.borrowedCount = book.getBorrowedCount();
      dto.borrowRate = book.getBorrowRate();
      dto.hasAvailableCopies = book.hasAvailableCopies();
    }

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
