import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { IReaderRepository, READER_REPOSITORY } from '../../domain/repositories/reader-repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * 删除读者用例
 *
 * 业务规则：
 * 1. 读者必须存在
 * 2. 不能删除有未归还图书的读者
 */
@Injectable()
export class DeleteReaderUseCase {
  constructor(
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. 验证读者是否存在
    const reader = await this.readerRepository.findById(id);
    if (!reader) {
      throw new NotFoundException(`读者不存在: ${id}`);
    }

    // 2. 检查是否有未归还的图书
    const activeBorrowCount = await this.prisma.borrowRecord.count({
      where: {
        readerId: id,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    if (activeBorrowCount > 0) {
      throw new ConflictException(`该读者有 ${activeBorrowCount} 本未归还图书，无法删除`);
    }

    // 3. 删除读者
    await this.readerRepository.delete(id);
  }
}
