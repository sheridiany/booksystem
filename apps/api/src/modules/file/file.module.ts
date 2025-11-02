/**
 * FileModule - 文件管理模块
 *
 * 职责:
 * - 配置文件管理模块的依赖注入
 * - 注册控制器、用例、仓储、服务
 * - 导出共享服务供其他模块使用
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../shared/prisma/prisma.module';

// Presentation
import { FileController } from './presentation/controllers/file.controller';

// Application
import { UploadFileUseCase } from './application/use-cases/upload-file.use-case';
import { GetFileMetadataUseCase } from './application/use-cases/get-file-metadata.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';

// Infrastructure
import { FileMetadataRepositoryImpl } from './infrastructure/repositories/file-metadata.repository.impl';
import { FileStorageService } from './infrastructure/services/file-storage.service';

// Domain
import { IFileMetadataRepository } from './domain/repositories/file-metadata.repository';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [FileController],
  providers: [
    // Use Cases
    UploadFileUseCase,
    GetFileMetadataUseCase,
    DeleteFileUseCase,

    // Services
    FileStorageService,

    // Repositories
    {
      provide: IFileMetadataRepository,
      useClass: FileMetadataRepositoryImpl,
    },
  ],
  exports: [
    // 导出供其他模块使用
    IFileMetadataRepository,
    FileStorageService,
    GetFileMetadataUseCase,
  ],
})
export class FileModule {}
