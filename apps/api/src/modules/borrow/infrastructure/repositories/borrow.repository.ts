import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IBorrowRepository } from '../../domain/repositories/borrow-repository.interface';
import { BorrowRecord, BorrowStatus } from '../../domain/entities/borrow-record.entity';

/**
 * 借阅仓储实现 (Prisma)
 */
@Injectable()
export class BorrowRepository implements IBorrowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(borrowRecord: BorrowRecord): Promise<BorrowRecord> {
    const data = {
      id: borrowRecord.id,
      bookCopyId: borrowRecord.bookCopyId,
      readerId: borrowRecord.readerId,
      borrowDate: borrowRecord.borrowDate,
      dueDate: borrowRecord.dueDate,
      returnDate: borrowRecord.returnDate,
      renewCount: borrowRecord.renewCount,
      status: borrowRecord.status,
      createdAt: borrowRecord.createdAt,
      updatedAt: borrowRecord.updatedAt,
    };

    // openGauss 不支持 upsert, 使用 findUnique + create/update
    const existing = await this.prisma.borrowRecord.findUnique({
      where: { id: borrowRecord.id },
    });

    const saved = existing
      ? await this.prisma.borrowRecord.update({
          where: { id: borrowRecord.id },
          data,
        })
      : await this.prisma.borrowRecord.create({ data });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<BorrowRecord | null> {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    readerId?: string;
    bookCopyId?: string;
    status?: BorrowStatus;
  }): Promise<{
    items: BorrowRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (params.readerId) {
      where.readerId = params.readerId;
    }

    if (params.bookCopyId) {
      where.bookCopyId = params.bookCopyId;
    }

    if (params.status) {
      where.status = params.status;
    }

    // 查询总数和数据
    const [total, records] = await Promise.all([
      this.prisma.borrowRecord.count({ where }),
      this.prisma.borrowRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ borrowDate: 'desc' }],
      }),
    ]);

    return {
      items: records.map((r) => this.toDomain(r)),
      total,
      page,
      pageSize,
    };
  }

  async findByReaderId(readerId: string, status?: BorrowStatus): Promise<BorrowRecord[]> {
    const where: any = { readerId };

    if (status) {
      where.status = status;
    }

    const records = await this.prisma.borrowRecord.findMany({
      where,
      orderBy: [{ borrowDate: 'desc' }],
    });

    return records.map((r) => this.toDomain(r));
  }

  async findByBookCopyId(bookCopyId: string, status?: BorrowStatus): Promise<BorrowRecord[]> {
    const where: any = { bookCopyId };

    if (status) {
      where.status = status;
    }

    const records = await this.prisma.borrowRecord.findMany({
      where,
      orderBy: [{ borrowDate: 'desc' }],
    });

    return records.map((r) => this.toDomain(r));
  }

  async findOverdue(limit = 100): Promise<BorrowRecord[]> {
    const records = await this.prisma.borrowRecord.findMany({
      where: {
        status: { in: ['BORROWED', 'OVERDUE'] },
        returnDate: null,
        dueDate: { lt: new Date() },
      },
      orderBy: [{ dueDate: 'asc' }],
      take: limit,
    });

    return records.map((r) => this.toDomain(r));
  }

  async countActiveByReader(readerId: string): Promise<number> {
    return await this.prisma.borrowRecord.count({
      where: {
        readerId,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });
  }

  async hasOverdueByReader(readerId: string): Promise<boolean> {
    const count = await this.prisma.borrowRecord.count({
      where: {
        readerId,
        status: 'OVERDUE',
      },
    });

    return count > 0;
  }

  async hasActiveByBookCopy(bookCopyId: string): Promise<boolean> {
    const count = await this.prisma.borrowRecord.count({
      where: {
        bookCopyId,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    return count > 0;
  }

  async count(params?: {
    readerId?: string;
    bookCopyId?: string;
    status?: BorrowStatus;
  }): Promise<number> {
    const where: any = {};

    if (params?.readerId) {
      where.readerId = params.readerId;
    }

    if (params?.bookCopyId) {
      where.bookCopyId = params.bookCopyId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    return await this.prisma.borrowRecord.count({ where });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.borrowRecord.delete({
      where: { id },
    });
  }

  /**
   * 批量更新逾期状态
   * 定时任务调用，将逾期但状态为 BORROWED 的记录更新为 OVERDUE
   */
  async updateOverdueStatus(): Promise<number> {
    const result = await this.prisma.borrowRecord.updateMany({
      where: {
        status: 'BORROWED',
        returnDate: null,
        dueDate: { lt: new Date() },
      },
      data: {
        status: 'OVERDUE',
        updatedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Prisma 模型转领域实体
   */
  private toDomain(prismaRecord: any): BorrowRecord {
    return new BorrowRecord({
      id: prismaRecord.id,
      bookCopyId: prismaRecord.bookCopyId,
      readerId: prismaRecord.readerId,
      borrowDate: prismaRecord.borrowDate,
      dueDate: prismaRecord.dueDate,
      returnDate: prismaRecord.returnDate,
      renewCount: prismaRecord.renewCount,
      status: prismaRecord.status as BorrowStatus,
      createdAt: prismaRecord.createdAt,
      updatedAt: prismaRecord.updatedAt,
    });
  }
}
