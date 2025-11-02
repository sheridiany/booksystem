import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReaderRepository, READER_REPOSITORY } from '../../domain/repositories/reader-repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ReaderStatisticsDto } from '../dto/reader.dto';

/**
 * 获取读者统计信息用例
 */
@Injectable()
export class GetReaderStatisticsUseCase {
  constructor(
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(readerId: string): Promise<ReaderStatisticsDto> {
    // 1. 验证读者是否存在
    const reader = await this.readerRepository.findById(readerId);
    if (!reader) {
      throw new NotFoundException(`读者不存在: ${readerId}`);
    }

    // 2. 统计总借阅次数
    const totalBorrowCount = await this.prisma.borrowRecord.count({
      where: { readerId },
    });

    // 3. 统计当前借阅数（未归还）
    const currentBorrowCount = await this.prisma.borrowRecord.count({
      where: {
        readerId,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    // 4. 统计逾期次数
    const overdueCount = await this.prisma.borrowRecord.count({
      where: {
        readerId,
        status: 'OVERDUE',
      },
    });

    // 5. 计算剩余可借阅数
    const availableBorrowCount = reader.maxBorrowLimit - currentBorrowCount;

    return {
      readerId,
      totalBorrowCount,
      currentBorrowCount,
      overdueCount,
      maxBorrowLimit: reader.maxBorrowLimit,
      availableBorrowCount: Math.max(0, availableBorrowCount),
    };
  }
}
