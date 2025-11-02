import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IBorrowRepository, BORROW_REPOSITORY } from '../../domain/repositories/borrow-repository.interface';
import { BOOK_COPY_REPOSITORY, IBookCopyRepository } from '@/modules/book/domain/repositories/book-copy.repository.interface';
import { IReaderRepository, READER_REPOSITORY } from '@/modules/reader/domain/repositories/reader-repository.interface';
import { BorrowDomainService } from '../../domain/services/borrow-domain.service';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { BorrowBookDto } from '../dto/borrow.dto';
import { BorrowPolicy } from '../../domain/value-objects/borrow-policy.vo';
import { BookCopyType } from '@/modules/book/domain/entities/book-copy.entity';

/**
 * 借书用例
 *
 * 业务流程（已调整）：
 * 1. 加载图书载体和读者实体
 * 2. 校验借阅资格（使用领域服务）
 * 3. 创建借阅记录
 * 4. 减少载体库存（仅纸质书）
 * 5. 保存借阅记录和载体
 */
@Injectable()
export class BorrowBookUseCase {
  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: IBorrowRepository,
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
    private readonly borrowDomainService: BorrowDomainService,
  ) {}

  async execute(dto: BorrowBookDto): Promise<BorrowRecord> {
    // 1. 加载图书载体实体
    const bookCopy = await this.bookCopyRepository.findById(dto.bookCopyId);
    if (!bookCopy) {
      throw new NotFoundException(`图书载体不存在: ${dto.bookCopyId}`);
    }

    // 2. 加载读者实体
    const reader = await this.readerRepository.findById(dto.readerId);
    if (!reader) {
      throw new NotFoundException(`读者不存在: ${dto.readerId}`);
    }

    // 3. 查询读者当前借阅数量
    const currentBorrowCount = await this.borrowRepository.countActiveByReader(dto.readerId);

    // 4. 检查读者是否有逾期图书
    const hasOverdueBorrows = await this.borrowRepository.hasOverdueByReader(dto.readerId);

    // 5. 校验借阅资格（使用领域服务）
    const canBorrowResult = this.borrowDomainService.canBorrow(
      bookCopy,
      reader,
      currentBorrowCount,
      hasOverdueBorrows,
    );

    if (!canBorrowResult.can) {
      throw new ConflictException(canBorrowResult.reason);
    }

    // 6. 获取借阅策略和确定归还日期
    const policy = BorrowPolicy.getDefault();
    const borrowDays = dto.borrowDays || policy.defaultBorrowDays;

    // 电子书可能不需要归还日期
    const dueDate = bookCopy.type === BookCopyType.EBOOK
      ? null
      : new Date(Date.now() + borrowDays * 24 * 60 * 60 * 1000);

    // 7. 创建借阅记录实体
    const borrowRecord = new BorrowRecord({
      id: uuidv4(),
      bookCopyId: dto.bookCopyId,
      readerId: dto.readerId,
      borrowDate: new Date(),
      dueDate,
      status: 'BORROWED',
    });

    // 8. 减少载体库存（bookCopy.borrow()会智能处理：纸质书减库存，电子书无操作）
    bookCopy.borrow();

    // 9. 保存借阅记录和载体（事务）
    await this.borrowRepository.save(borrowRecord);

    // 仅纸质书需要更新库存
    if (bookCopy.type === BookCopyType.PHYSICAL) {
      await this.bookCopyRepository.save(bookCopy);
    }

    return borrowRecord;
  }
}
