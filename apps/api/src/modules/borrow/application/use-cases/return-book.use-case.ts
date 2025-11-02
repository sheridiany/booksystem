import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBorrowRepository, BORROW_REPOSITORY } from '../../domain/repositories/borrow-repository.interface';
import { IBookCopyRepository, BOOK_COPY_REPOSITORY } from '@/modules/book/domain/repositories/book-copy.repository.interface';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';

/**
 * 还书用例
 *
 * 业务流程：
 * 1. 加载借阅记录
 * 2. 办理归还（更新借阅记录状态）
 * 3. 增加图书载体库存
 * 4. 保存借阅记录和图书载体
 */
@Injectable()
export class ReturnBookUseCase {
  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: IBorrowRepository,
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
  ) {}

  async execute(borrowRecordId: string): Promise<BorrowRecord> {
    // 1. 加载借阅记录
    const borrowRecord = await this.borrowRepository.findById(borrowRecordId);
    if (!borrowRecord) {
      throw new NotFoundException(`借阅记录不存在: ${borrowRecordId}`);
    }

    // 2. 加载图书载体实体
    const bookCopy = await this.bookCopyRepository.findById(borrowRecord.bookCopyId);
    if (!bookCopy) {
      throw new NotFoundException(`图书载体不存在: ${borrowRecord.bookCopyId}`);
    }

    // 3. 办理归还（领域逻辑）
    borrowRecord.returnBook();

    // 4. 增加图书载体库存（仅纸质书）
    bookCopy.returnBook();

    // 5. 保存借阅记录和图书载体
    await this.borrowRepository.save(borrowRecord);
    if (bookCopy.isPhysical()) {
      await this.bookCopyRepository.save(bookCopy);
    }

    return borrowRecord;
  }
}
