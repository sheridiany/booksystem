import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBorrowRepository, BORROW_REPOSITORY } from '../../domain/repositories/borrow-repository.interface';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { RenewBorrowDto } from '../dto/borrow.dto';
import { BorrowPolicy } from '../../domain/value-objects/borrow-policy.vo';

/**
 * 续借用例
 *
 * 业务流程：
 * 1. 加载借阅记录
 * 2. 办理续借（更新应还日期，增加续借次数）
 * 3. 保存借阅记录
 */
@Injectable()
export class RenewBorrowUseCase {
  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: IBorrowRepository,
  ) {}

  async execute(borrowRecordId: string, dto: RenewBorrowDto): Promise<BorrowRecord> {
    // 1. 加载借阅记录
    const borrowRecord = await this.borrowRepository.findById(borrowRecordId);
    if (!borrowRecord) {
      throw new NotFoundException(`借阅记录不存在: ${borrowRecordId}`);
    }

    // 2. 获取借阅策略
    const policy = BorrowPolicy.getDefault();
    const renewDays = dto.renewDays || policy.renewDays;

    // 3. 办理续借（领域逻辑，会校验续借次数和逾期状态）
    borrowRecord.renew(renewDays, policy.maxRenewCount);

    // 4. 保存借阅记录
    return await this.borrowRepository.save(borrowRecord);
  }
}
