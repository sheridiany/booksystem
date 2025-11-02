import { Injectable, Inject } from '@nestjs/common';
import { IBorrowRepository, BORROW_REPOSITORY } from '../../domain/repositories/borrow-repository.interface';

/**
 * 检查并更新逾期状态用例
 *
 * 用于定时任务，批量更新逾期状态
 */
@Injectable()
export class CheckOverdueUseCase {
  constructor(
    @Inject(BORROW_REPOSITORY)
    private readonly borrowRepository: IBorrowRepository,
  ) {}

  /**
   * 批量更新逾期状态
   * @returns 更新的记录数
   */
  async execute(): Promise<number> {
    return await this.borrowRepository.updateOverdueStatus();
  }
}
