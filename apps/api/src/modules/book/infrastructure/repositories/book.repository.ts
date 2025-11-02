import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IBookRepository } from '../../domain/repositories/book.repository.interface';
import { Book } from '../../domain/entities/book.entity';

/**
 * 图书仓储实现 (Prisma)
 */
@Injectable()
export class BookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(book: Book): Promise<Book> {
    const data = {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      categoryId: book.categoryId,
      coverFileId: book.coverFileId,
      description: book.description,
      publishDate: book.publishDate,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };

    // openGauss 不支持 upsert, 使用 findUnique + create/update
    const existing = await this.prisma.book.findUnique({
      where: { id: book.id },
    });

    const saved = existing
      ? await this.prisma.book.update({
          where: { id: book.id },
          data,
        })
      : await this.prisma.book.create({ data });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    return book ? this.toDomain(book) : null;
  }

  async findByISBN(isbn: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({
      where: { isbn },
    });

    return book ? this.toDomain(book) : null;
  }

  async findAll(params?: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    search?: string;
  }): Promise<{
    items: Book[];
    total: number;
  }> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
        { author: { contains: params.search } },
        { isbn: { contains: params.search } },
      ];
    }

    // 查询总数和数据
    const [total, books] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ createdAt: 'desc' }],
      }),
    ]);

    return {
      items: books.map((b) => this.toDomain(b)),
      total,
    };
  }

  async findByCategoryId(categoryId: string): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: { categoryId },
      orderBy: [{ title: 'asc' }],
    });

    return books.map((b) => this.toDomain(b));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.book.delete({
      where: { id },
    });
  }

  async existsByISBN(isbn: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.book.count({
      where: {
        isbn,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return count > 0;
  }

  async hasActiveBorrows(id: string): Promise<boolean> {
    // 检查该图书的所有载体是否有活跃借阅记录
    const count = await this.prisma.borrowRecord.count({
      where: {
        bookCopy: {
          bookId: id,
        },
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    return count > 0;
  }

  async findPopular(limit = 10): Promise<Book[]> {
    // 通过 BookCopy 关联查询借阅次数最多的图书
    const borrowRecords = await this.prisma.borrowRecord.findMany({
      include: {
        bookCopy: {
          select: {
            bookId: true,
          },
        },
      },
    });

    // 按 bookId 分组统计借阅次数
    const borrowCountMap = new Map<string, number>();
    borrowRecords.forEach((record) => {
      const bookId = record.bookCopy.bookId;
      borrowCountMap.set(bookId, (borrowCountMap.get(bookId) || 0) + 1);
    });

    // 排序并取前 N 个
    const sortedBookIds = Array.from(borrowCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([bookId]) => bookId);

    // 获取图书详情
    const books = await this.prisma.book.findMany({
      where: {
        id: { in: sortedBookIds },
      },
    });

    // 按借阅次数排序返回
    const sortedBooks = sortedBookIds
      .map((id) => books.find((b) => b.id === id))
      .filter((b) => b !== undefined);

    return sortedBooks.map((b) => this.toDomain(b!));
  }

  /**
   * Prisma 模型转领域实体
   */
  private toDomain(prismaBook: any): Book {
    return new Book({
      id: prismaBook.id,
      isbn: prismaBook.isbn,
      title: prismaBook.title,
      author: prismaBook.author,
      publisher: prismaBook.publisher,
      categoryId: prismaBook.categoryId,
      coverFileId: prismaBook.coverFileId,
      description: prismaBook.description,
      publishDate: prismaBook.publishDate,
      createdAt: prismaBook.createdAt,
      updatedAt: prismaBook.updatedAt,
    });
  }
}
