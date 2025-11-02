import { Injectable, Inject } from '@nestjs/common';
import { IBorrowRepository, BORROW_REPOSITORY } from '../../domain/repositories/borrow-repository.interface';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { QueryBorrowsDto } from '../dto/borrow.dto';

/**
 * 查询借阅记录用例
 */
@Injectable()
export class GetBorrowsUseCase {
  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: IBorrowRepository,
  ) {}

  async execute(query: QueryBorrowsDto): Promise<{
    items: BorrowRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return await this.borrowRepository.findAll({
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      readerId: query.readerId,
      bookId: query.bookId,
      status: query.status,
    });
  }

  /**
   * 获取单条借阅记录
   */
  async getById(id: string): Promise<BorrowRecord | null> {
    return await this.borrowRepository.findById(id);
  }

  /**
   * 获取逾期记录
   */
  async getOverdue(limit = 100): Promise<BorrowRecord[]> {
    return await this.borrowRepository.findOverdue(limit);
  }

  /**
   * 获取读者的借阅记录
   */
  async getByReader(readerId: string): Promise<BorrowRecord[]> {
    return await this.borrowRepository.findByReaderId(readerId);
  }

  /**
   * 获取图书的借阅记录
   */
  async getByBook(bookId: string): Promise<BorrowRecord[]> {
    return await this.borrowRepository.findByBookId(bookId);
  }
}
