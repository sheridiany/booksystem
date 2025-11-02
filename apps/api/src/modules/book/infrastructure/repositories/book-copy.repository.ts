import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IBookCopyRepository } from '../../domain/repositories/book-copy.repository.interface';
import {
  BookCopy,
  BookCopyType,
  BookCopyStatus,
  EbookFormat,
} from '../../domain/entities/book-copy.entity';

/**
 * 图书载体仓储实现 (Prisma)
 */
@Injectable()
export class BookCopyRepository implements IBookCopyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(bookCopy: BookCopy): Promise<BookCopy> {
    const data = {
      id: bookCopy.id,
      bookId: bookCopy.bookId,
      type: bookCopy.type,
      status: bookCopy.status,
      totalCopies: bookCopy.totalCopies,
      availableCopies: bookCopy.availableCopies,
      location: bookCopy.location,
      ebookFormat: bookCopy.ebookFormat,
      fileId: bookCopy.fileId,
      fileSize: bookCopy.fileSize,
      createdAt: bookCopy.createdAt,
      updatedAt: bookCopy.updatedAt,
    };

    // openGauss 不支持 upsert, 使用 findUnique + create/update
    const existing = await this.prisma.bookCopy.findUnique({
      where: { id: bookCopy.id },
    });

    const saved = existing
      ? await this.prisma.bookCopy.update({
          where: { id: bookCopy.id },
          data,
        })
      : await this.prisma.bookCopy.create({ data });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<BookCopy | null> {
    const bookCopy = await this.prisma.bookCopy.findUnique({
      where: { id },
    });

    return bookCopy ? this.toDomain(bookCopy) : null;
  }

  async findByBookId(bookId: string): Promise<BookCopy[]> {
    const bookCopies = await this.prisma.bookCopy.findMany({
      where: { bookId },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    });

    return bookCopies.map((bc) => this.toDomain(bc));
  }

  async findByBookIdAndType(
    bookId: string,
    type: BookCopyType,
  ): Promise<BookCopy[]> {
    const bookCopies = await this.prisma.bookCopy.findMany({
      where: {
        bookId,
        type,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return bookCopies.map((bc) => this.toDomain(bc));
  }

  async findAvailableByBookIdAndType(
    bookId: string,
    type: BookCopyType,
  ): Promise<BookCopy[]> {
    const where: any = {
      bookId,
      type,
      status: BookCopyStatus.AVAILABLE,
    };

    // 纸质书需要额外检查库存
    if (type === BookCopyType.PHYSICAL) {
      where.availableCopies = { gt: 0 };
    }

    const bookCopies = await this.prisma.bookCopy.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });

    return bookCopies.map((bc) => this.toDomain(bc));
  }

  async findAll(params?: {
    page?: number;
    pageSize?: number;
    bookId?: string;
    type?: BookCopyType;
    status?: BookCopyStatus;
  }): Promise<{
    items: BookCopy[];
    total: number;
  }> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (params?.bookId) {
      where.bookId = params.bookId;
    }

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.status) {
      where.status = params.status;
    }

    // 查询总数和数据
    const [total, bookCopies] = await Promise.all([
      this.prisma.bookCopy.count({ where }),
      this.prisma.bookCopy.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ createdAt: 'desc' }],
      }),
    ]);

    return {
      items: bookCopies.map((bc) => this.toDomain(bc)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bookCopy.delete({
      where: { id },
    });
  }

  async hasActiveBorrows(id: string): Promise<boolean> {
    const count = await this.prisma.borrowRecord.count({
      where: {
        bookCopyId: id,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    return count > 0;
  }

  async deleteByBookId(bookId: string): Promise<void> {
    await this.prisma.bookCopy.deleteMany({
      where: { bookId },
    });
  }

  async updateStatus(id: string, status: BookCopyStatus): Promise<void> {
    await this.prisma.bookCopy.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async countByBookId(bookId: string): Promise<{
    physical: number;
    ebook: number;
    total: number;
  }> {
    const [physical, ebook] = await Promise.all([
      this.prisma.bookCopy.count({
        where: {
          bookId,
          type: BookCopyType.PHYSICAL,
        },
      }),
      this.prisma.bookCopy.count({
        where: {
          bookId,
          type: BookCopyType.EBOOK,
        },
      }),
    ]);

    return {
      physical,
      ebook,
      total: physical + ebook,
    };
  }

  async getTotalPhysicalInventory(): Promise<{
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
  }> {
    const physicalCopies = await this.prisma.bookCopy.findMany({
      where: {
        type: BookCopyType.PHYSICAL,
      },
      select: {
        totalCopies: true,
        availableCopies: true,
      },
    });

    const totalCopies = physicalCopies.reduce(
      (sum, copy) => sum + (copy.totalCopies || 0),
      0,
    );

    const availableCopies = physicalCopies.reduce(
      (sum, copy) => sum + (copy.availableCopies || 0),
      0,
    );

    const borrowedCopies = totalCopies - availableCopies;

    return {
      totalCopies,
      availableCopies,
      borrowedCopies,
    };
  }

  /**
   * Prisma 模型转领域实体
   */
  private toDomain(prismaBookCopy: any): BookCopy {
    return new BookCopy({
      id: prismaBookCopy.id,
      bookId: prismaBookCopy.bookId,
      type: prismaBookCopy.type as BookCopyType,
      status: prismaBookCopy.status as BookCopyStatus,
      totalCopies: prismaBookCopy.totalCopies,
      availableCopies: prismaBookCopy.availableCopies,
      location: prismaBookCopy.location,
      ebookFormat: prismaBookCopy.ebookFormat as EbookFormat | null,
      fileId: prismaBookCopy.fileId,
      fileSize: prismaBookCopy.fileSize,
      createdAt: prismaBookCopy.createdAt,
      updatedAt: prismaBookCopy.updatedAt,
    });
  }
}
