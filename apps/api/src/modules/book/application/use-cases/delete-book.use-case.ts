import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IBookRepository, BOOK_REPOSITORY } from '../../domain/repositories/book.repository.interface';

/**
 * 删除图书用例
 *
 * 业务规则：
 * 1. 图书必须存在
 * 2. 不能删除有活跃借阅记录的图书
 */
@Injectable()
export class DeleteBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. 检查图书是否存在
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${id}`);
    }

    // 2. 检查是否有活跃借阅记录
    const hasActiveBorrows = await this.bookRepository.hasActiveBorrows(id);
    if (hasActiveBorrows) {
      throw new BadRequestException('该图书存在未归还的借阅记录，无法删除');
    }

    // 3. 删除图书
    await this.bookRepository.delete(id);
  }
}
