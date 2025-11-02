import { Inject, Injectable } from '@nestjs/common';
import {
  IBookCopyRepository,
  BOOK_COPY_REPOSITORY,
} from '../../domain/repositories/book-copy.repository.interface';

/**
 * 删除图书载体用例
 *
 * 业务规则：
 * 1. 检查载体是否存在
 * 2. 检查是否有活跃的借阅记录（防止删除正在借阅的载体）
 * 3. 执行删除
 */
@Injectable()
export class DeleteBookCopyUseCase {
  constructor(
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. 检查载体是否存在
    const bookCopy = await this.bookCopyRepository.findById(id);
    if (!bookCopy) {
      throw new Error(`图书载体不存在: ${id}`);
    }

    // 2. 检查是否有活跃借阅记录
    const hasActiveBorrows = await this.bookCopyRepository.hasActiveBorrows(id);
    if (hasActiveBorrows) {
      throw new Error('该载体有活跃的借阅记录，无法删除');
    }

    // 3. 执行删除
    await this.bookCopyRepository.delete(id);
  }
}
