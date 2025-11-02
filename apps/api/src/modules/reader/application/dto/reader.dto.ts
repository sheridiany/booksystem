import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Reader } from '../../domain/entities/reader.entity';

/**
 * 创建读者 DTO
 */
export class CreateReaderDto {
  @IsString()
  @IsNotEmpty({ message: '用户 ID 不能为空' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: '读者姓名不能为空' })
  name: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: '借阅上限不能为负数' })
  @Max(20, { message: '借阅上限不能超过 20 本' })
  maxBorrowLimit?: number;
}

/**
 * 更新读者 DTO
 */
export class UpdateReaderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '读者姓名不能为空' })
  name?: string;

  @IsOptional()
  @IsString()
  studentId?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string | null;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: '借阅上限不能为负数' })
  @Max(20, { message: '借阅上限不能超过 20 本' })
  maxBorrowLimit?: number;
}

/**
 * 查询读者 DTO
 */
export class QueryReadersDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  keyword?: string; // 搜索姓名、学号、手机号、邮箱
}

/**
 * 读者响应 DTO
 */
export class ReaderDto {
  id!: string;
  userId!: string;
  name!: string;
  studentId!: string | null;
  phone!: string | null;
  email!: string | null;
  status!: 'ACTIVE' | 'INACTIVE';
  maxBorrowLimit!: number;
  createdAt!: string;
  updatedAt!: string;

  // 可选的统计信息
  currentBorrowCount?: number;
  hasOverdueBorrows?: boolean;

  /**
   * 从领域实体转换为 DTO
   */
  static fromEntity(reader: Reader, includeStats = false): ReaderDto {
    const dto = new ReaderDto();
    dto.id = reader.id;
    dto.userId = reader.userId;
    dto.name = reader.name;
    dto.studentId = reader.studentId;
    dto.phone = reader.phone;
    dto.email = reader.email;
    dto.status = reader.status;
    dto.maxBorrowLimit = reader.maxBorrowLimit;
    dto.createdAt = reader.createdAt.toISOString();
    dto.updatedAt = reader.updatedAt.toISOString();

    // 统计信息由调用方提供（需要查询 BorrowRecord）
    if (includeStats) {
      // 这些字段将在 UseCase 中填充
      dto.currentBorrowCount = 0;
      dto.hasOverdueBorrows = false;
    }

    return dto;
  }
}

/**
 * 分页读者响应 DTO
 */
export class PaginatedReadersDto {
  items!: ReaderDto[];
  total!: number;
  page!: number;
  pageSize!: number;
  totalPages!: number;
}

/**
 * 读者统计 DTO
 */
export class ReaderStatisticsDto {
  readerId!: string;
  totalBorrowCount!: number; // 总借阅次数
  currentBorrowCount!: number; // 当前借阅数
  overdueCount!: number; // 逾期次数
  maxBorrowLimit!: number; // 借阅上限
  availableBorrowCount!: number; // 剩余可借阅数
}
