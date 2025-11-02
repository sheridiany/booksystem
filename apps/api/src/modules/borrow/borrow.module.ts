import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// Domain
import { BORROW_REPOSITORY } from './domain/repositories/borrow-repository.interface';
import { BorrowDomainService } from './domain/services/borrow-domain.service';

// Infrastructure
import { BorrowRepository } from './infrastructure/repositories/borrow.repository';

// Application
import { BorrowBookUseCase } from './application/use-cases/borrow-book.use-case';
import { ReturnBookUseCase } from './application/use-cases/return-book.use-case';
import { RenewBorrowUseCase } from './application/use-cases/renew-borrow.use-case';
import { GetBorrowsUseCase } from './application/use-cases/get-borrows.use-case';
import { CheckOverdueUseCase } from './application/use-cases/check-overdue.use-case';

// Presentation
import { BorrowController } from './presentation/controllers/borrow.controller';

// 导入其他模块以使用其仓储
import { BookModule } from '../book/book.module';
import { ReaderModule } from '../reader/reader.module';

@Module({
  imports: [PrismaModule, BookModule, ReaderModule],
  controllers: [BorrowController],
  providers: [
    // Repository
    {
      provide: BORROW_REPOSITORY,
      useClass: BorrowRepository,
    },
    // Domain Service
    BorrowDomainService,
    // Use Cases
    BorrowBookUseCase,
    ReturnBookUseCase,
    RenewBorrowUseCase,
    GetBorrowsUseCase,
    CheckOverdueUseCase,
  ],
  exports: [BORROW_REPOSITORY], // 导出给其他模块使用
})
export class BorrowModule {}
