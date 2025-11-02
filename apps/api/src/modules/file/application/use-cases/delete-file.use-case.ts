/**
 * DeleteFileUseCase - 删除文件用例
 *
 * 职责:
 * - 删除文件元数据
 * - 删除物理文件
 * - 确保数据一致性
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository';
import { FileStorageService } from '../../infrastructure/services/file-storage.service';

@Injectable()
export class DeleteFileUseCase {
  constructor(
    @Inject(IFileMetadataRepository)
    private readonly fileMetadataRepository: IFileMetadataRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute(fileId: string): Promise<void> {
    // 1. 查找文件元数据
    const fileMetadata = await this.fileMetadataRepository.findById(fileId);

    if (!fileMetadata) {
      throw new NotFoundException(`文件不存在: ${fileId}`);
    }

    // 2. 删除物理文件
    try {
      await this.fileStorageService.deleteFile(fileMetadata.filePath);
    } catch (error) {
      // 文件可能已被手动删除,记录日志但继续删除元数据
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(
        `删除物理文件失败 (${fileMetadata.filePath}):`,
        errorMessage,
      );
    }

    // 3. 删除数据库记录
    await this.fileMetadataRepository.delete(fileId);
  }
}
