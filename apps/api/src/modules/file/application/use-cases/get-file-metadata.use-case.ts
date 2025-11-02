/**
 * GetFileMetadataUseCase - 获取文件元数据用例
 *
 * 职责:
 * - 根据文件 ID 查询文件元数据
 * - 转换为 DTO 返回
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository';
import { FileMetadataDto } from '../dto/file-metadata.dto';
import { FileMetadata } from '../../domain/entities/file-metadata.entity';

@Injectable()
export class GetFileMetadataUseCase {
  constructor(
    @Inject(IFileMetadataRepository)
    private readonly fileMetadataRepository: IFileMetadataRepository,
  ) {}

  async execute(fileId: string): Promise<FileMetadataDto> {
    const fileMetadata = await this.fileMetadataRepository.findById(fileId);

    if (!fileMetadata) {
      throw new NotFoundException(`文件不存在: ${fileId}`);
    }

    return this.toDto(fileMetadata);
  }

  private toDto(fileMetadata: FileMetadata): FileMetadataDto {
    return {
      id: fileMetadata.id!,
      originalName: fileMetadata.originalName,
      storedName: fileMetadata.storedName,
      filePath: fileMetadata.filePath,
      fileType: fileMetadata.fileType,
      mimeType: fileMetadata.mimeType,
      size: fileMetadata.size,
      formattedSize: fileMetadata.getFormattedSize(),
      uploadedBy: fileMetadata.uploadedBy,
      createdAt: fileMetadata.createdAt,
    };
  }
}
