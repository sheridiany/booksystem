import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
} from 'class-validator';
import { BorrowRecord, BorrowStatus } from '../../domain/entities/borrow-record.entity';

/**
 * 借书 DTO
 *
 * 变更说明：bookId → bookCopyId
 * 现在借阅的是具体的载体（纸质书或电子书），而不是图书元信息
 */
export class BorrowBookDto {
  @IsString()
  @IsNotEmpty({ message: '图书载体 ID 不能为空' })
  bookCopyId: string; // 改为载体ID

  @IsString()
  @IsNotEmpty({ message: '读者 ID 不能为空' })
  readerId: string;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: '借阅天数至少为 1 天' })
  borrowDays?: number; // 默认 30 天（纸质书），电子书可能无需归还
}

/**
 * 还书 DTO
 */
export class ReturnBookDto {
  // 无需额外参数，从路由参数获取 borrowRecordId
}

/**
 * 续借 DTO
 */
export class RenewBorrowDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '续借天数至少为 1 天' })
  renewDays?: number; // 默认 30 天
}

/**
 * 查询借阅记录 DTO
 */
export class QueryBorrowsDto {
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
  readerId?: string;

  @IsOptional()
  @IsString()
  bookCopyId?: string; // 图书载体ID

  @IsOptional()
  @IsIn(['BORROWED', 'RETURNED', 'OVERDUE'])
  status?: BorrowStatus;
}

/**
 * 借阅记录响应 DTO
 */
export class BorrowDto {
  id!: string;
  bookCopyId!: string; // 改为载体ID
  readerId!: string;
  borrowDate!: string;
  dueDate!: string | null; // 改为可选：电子书可能无归还日期
  returnDate!: string | null;
  renewCount!: number;
  status!: BorrowStatus;
  createdAt!: string;
  updatedAt!: string;

  // 计算属性
  daysRemaining?: number; // 剩余天数（负数表示已逾期）
  overdueDays?: number; // 逾期天数
  borrowDays?: number; // 已借阅天数
  canRenew?: boolean; // 是否可以续借

  // 关联信息（可选，由调用方填充）
  bookTitle?: string;
  bookCopyType?: string; // PHYSICAL | EBOOK
  readerName?: string;

  /**
   * 从领域实体转换为 DTO
   */
  static fromEntity(borrowRecord: BorrowRecord, includeStats = false): BorrowDto {
    const dto = new BorrowDto();
    dto.id = borrowRecord.id;
    dto.bookCopyId = borrowRecord.bookCopyId;
    dto.readerId = borrowRecord.readerId;
    dto.borrowDate = borrowRecord.borrowDate.toISOString();
    dto.dueDate = borrowRecord.dueDate?.toISOString() || null;
    dto.returnDate = borrowRecord.returnDate?.toISOString() || null;
    dto.renewCount = borrowRecord.renewCount;
    dto.status = borrowRecord.status;
    dto.createdAt = borrowRecord.createdAt.toISOString();
    dto.updatedAt = borrowRecord.updatedAt.toISOString();

    // 可选：包含统计信息
    if (includeStats) {
      dto.daysRemaining = borrowRecord.getDaysRemaining();
      dto.overdueDays = borrowRecord.getOverdueDays();
      dto.borrowDays = borrowRecord.getBorrowDays();
      dto.canRenew = borrowRecord.canRenew();
    }

    return dto;
  }
}

/**
 * 分页借阅记录响应 DTO
 */
export class PaginatedBorrowsDto {
  items!: BorrowDto[];
  total!: number;
  page!: number;
  pageSize!: number;
  totalPages!: number;
}
