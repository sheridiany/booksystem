import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBorrowRepository, BORROW_REPOSITORY } from '../../domain/repositories/borrow-repository.interface';
import { IBookRepository, BOOK_REPOSITORY } from '@/modules/book/domain/repositories/book.repository.interface';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';

/**
 * 还书用例
 *
 * 业务流程：
 * 1. 加载借阅记录
 * 2. 办理归还（更新借阅记录状态）
 * 3. 增加图书库存
 * 4. 保存借阅记录和图书
 */
@Injectable()
export class ReturnBookUseCase {
  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: IBorrowRepository,
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(borrowRecordId: string): Promise<BorrowRecord> {
    // 1. 加载借阅记录
    const borrowRecord = await this.borrowRepository.findById(borrowRecordId);
    if (!borrowRecord) {
      throw new NotFoundException(`借阅记录不存在: ${borrowRecordId}`);
    }

    // 2. 加载图书实体
    const book = await this.bookRepository.findById(borrowRecord.bookId);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${borrowRecord.bookId}`);
    }

    // 3. 办理归还（领域逻辑）
    borrowRecord.returnBook();

    // 4. 增加图书库存
    book.returnBook();

    // 5. 保存借阅记录和图书（事务）
    await this.borrowRepository.save(borrowRecord);
    await this.bookRepository.save(book);

    return borrowRecord;
  }
}
