import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// Domain
import { READER_REPOSITORY } from './domain/repositories/reader-repository.interface';

// Infrastructure
import { ReaderRepository } from './infrastructure/repositories/reader.repository';

// Application
import { CreateReaderUseCase } from './application/use-cases/create-reader.use-case';
import { UpdateReaderUseCase } from './application/use-cases/update-reader.use-case';
import { DeleteReaderUseCase } from './application/use-cases/delete-reader.use-case';
import { GetReadersUseCase } from './application/use-cases/get-readers.use-case';
import { GetReaderStatisticsUseCase } from './application/use-cases/get-reader-statistics.use-case';

// Presentation
import { ReaderController } from './presentation/controllers/reader.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReaderController],
  providers: [
    // Repository
    {
      provide: READER_REPOSITORY,
      useClass: ReaderRepository,
    },
    // Use Cases
    CreateReaderUseCase,
    UpdateReaderUseCase,
    DeleteReaderUseCase,
    GetReadersUseCase,
    GetReaderStatisticsUseCase,
  ],
  exports: [READER_REPOSITORY], // 导出给借阅模块使用
})
export class ReaderModule {}
