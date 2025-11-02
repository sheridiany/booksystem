import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BookCopy,
  BookCopyType,
  BookCopyStatus,
  EbookFormat,
} from '../../domain/entities/book-copy.entity';

/**
 * 创建图书载体 DTO
 */
export class CreateBookCopyDto {
  @IsString()
  @IsNotEmpty({ message: '图书 ID 不能为空' })
  bookId: string;

  @IsString()
  @IsIn(['PHYSICAL', 'EBOOK'], { message: '载体类型必须是 PHYSICAL 或 EBOOK' })
  type: BookCopyType;

  // ========== 纸质书字段（条件必填）==========
  @ValidateIf((o) => o.type === 'PHYSICAL')
  @IsNumber({}, { message: '总库存必须是数字' })
  @Min(1, { message: '纸质图书总库存至少为 1' })
  totalCopies?: number;

  @ValidateIf((o) => o.type === 'PHYSICAL')
  @IsOptional()
  @IsString()
  location?: string;

  // ========== 电子书字段（条件必填）==========
  @ValidateIf((o) => o.type === 'EBOOK')
  @IsString({ message: '电子书格式不能为空' })
  @IsIn(['pdf', 'epub', 'mobi'], { message: '电子书格式必须是 pdf、epub 或 mobi' })
  ebookFormat?: EbookFormat;

  @ValidateIf((o) => o.type === 'EBOOK')
  @IsString({ message: '电子书文件 ID 不能为空' })
  @IsNotEmpty({ message: '电子书必须上传文件' })
  fileId?: string;

  @ValidateIf((o) => o.type === 'EBOOK')
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '文件大小必须大于 0' })
  fileSize?: number;
}

/**
 * 更新图书载体 DTO
 */
export class UpdateBookCopyDto {
  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'], {
    message: '状态必须是 AVAILABLE、UNAVAILABLE 或 MAINTENANCE',
  })
  status?: BookCopyStatus;

  // ========== 纸质书更新字段 ==========
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '总库存至少为 1' })
  totalCopies?: number;

  @IsOptional()
  @IsString()
  location?: string | null;

  // ========== 电子书更新字段 ==========
  @IsOptional()
  @IsString()
  fileId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  fileSize?: number;
}

/**
 * 图书载体查询 DTO
 */
export class QueryBookCopiesDto {
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
  bookId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PHYSICAL', 'EBOOK'])
  type?: BookCopyType;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'])
  status?: BookCopyStatus;
}

/**
 * 图书载体响应 DTO
 */
export class BookCopyDto {
  id!: string;
  bookId!: string;
  type!: string; // PHYSICAL | EBOOK
  status!: string;

  // 纸质书字段
  totalCopies!: number | null;
  availableCopies!: number | null;
  location!: string | null;

  // 电子书字段
  ebookFormat!: string | null;
  fileId!: string | null;
  fileSize!: number | null;

  createdAt!: string;
  updatedAt!: string;

  // 计算属性
  isAvailable?: boolean;
  borrowedCount?: number;
  borrowRate?: number;
  typeName?: string;
  statusName?: string;

  /**
   * 从领域实体转换为 DTO
   */
  static fromEntity(bookCopy: BookCopy, includeStats = false): BookCopyDto {
    const dto = new BookCopyDto();
    dto.id = bookCopy.id;
    dto.bookId = bookCopy.bookId;
    dto.type = bookCopy.type;
    dto.status = bookCopy.status;

    // 纸质书字段
    dto.totalCopies = bookCopy.totalCopies;
    dto.availableCopies = bookCopy.availableCopies;
    dto.location = bookCopy.location;

    // 电子书字段
    dto.ebookFormat = bookCopy.ebookFormat;
    dto.fileId = bookCopy.fileId;
    dto.fileSize = bookCopy.fileSize;

    dto.createdAt = bookCopy.createdAt.toISOString();
    dto.updatedAt = bookCopy.updatedAt.toISOString();

    // 可选：包含统计信息
    if (includeStats) {
      dto.isAvailable = bookCopy.isAvailable();
      dto.borrowedCount = bookCopy.getBorrowedCount();
      dto.borrowRate = bookCopy.getBorrowRate();
      dto.typeName = bookCopy.getTypeName();
      dto.statusName = bookCopy.getStatusName();
    }

    return dto;
  }
}

/**
 * 分页图书载体响应 DTO
 */
export class PaginatedBookCopiesDto {
  items!: BookCopyDto[];
  total!: number;
  page!: number;
  pageSize!: number;
  totalPages!: number;
}

/**
 * 图书载体统计 DTO
 */
export class BookCopyStatsDto {
  physical!: number; // 纸质书载体数量
  ebook!: number; // 电子书载体数量
  total!: number; // 总载体数量
}
