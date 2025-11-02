import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IBorrowRepository, BORROW_REPOSITORY } from '../../domain/repositories/borrow-repository.interface';
import { IBookRepository, BOOK_REPOSITORY } from '@/modules/book/domain/repositories/book.repository.interface';
import { IReaderRepository, READER_REPOSITORY } from '@/modules/reader/domain/repositories/reader-repository.interface';
import { BorrowDomainService } from '../../domain/services/borrow-domain.service';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { BorrowBookDto } from '../dto/borrow.dto';
import { BorrowPolicy } from '../../domain/value-objects/borrow-policy.vo';

/**
 * 借书用例
 *
 * 业务流程：
 * 1. 加载图书和读者实体
 * 2. 校验借阅资格（使用领域服务）
 * 3. 创建借阅记录
 * 4. 减少图书库存
 * 5. 保存借阅记录和图书
 */
@Injectable()
export class BorrowBookUseCase {
  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: IBorrowRepository,
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
    private readonly borrowDomainService: BorrowDomainService,
  ) {}

  async execute(dto: BorrowBookDto): Promise<BorrowRecord> {
    // 1. 加载图书实体
    const book = await this.bookRepository.findById(dto.bookId);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${dto.bookId}`);
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
      book,
      reader,
      currentBorrowCount,
      hasOverdueBorrows,
    );

    if (!canBorrowResult.can) {
      throw new ConflictException(canBorrowResult.reason);
    }

    // 6. 获取借阅策略
    const policy = BorrowPolicy.getDefault();
    const borrowDays = dto.borrowDays || policy.defaultBorrowDays;

    // 7. 创建借阅记录实体
    const borrowRecord = BorrowRecord.borrow(dto.bookId, dto.readerId, borrowDays);
    borrowRecord.id = uuidv4(); // 生成 UUID

    // 8. 减少图书库存
    book.borrow();

    // 9. 保存借阅记录和图书（事务）
    await this.borrowRepository.save(borrowRecord);
    await this.bookRepository.save(book);

    return borrowRecord;
  }
}
