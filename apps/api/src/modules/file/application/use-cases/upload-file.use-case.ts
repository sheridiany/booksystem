/**
 * UploadFileUseCase - 文件上传用例
 *
 * 职责:
 * - 协调文件上传的业务流程
 * - 验证文件类型和大小
 * - 调用领域服务保存文件
 * - 保存文件元数据到数据库
 */

import { Inject, Injectable } from '@nestjs/common';
import { FileMetadata } from '../../domain/entities/file-metadata.entity';
import { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository';
import { FileStorageService } from '../../infrastructure/services/file-storage.service';
import { FileMetadataDto } from '../dto/file-metadata.dto';

export interface UploadFileInput {
  file: Express.Multer.File;
  uploadedBy: string;
}

@Injectable()
export class UploadFileUseCase {
  constructor(
    @Inject(IFileMetadataRepository)
    private readonly fileMetadataRepository: IFileMetadataRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute(input: UploadFileInput): Promise<FileMetadataDto> {
    const { file, uploadedBy } = input;

    // 1. 保存文件到本地存储
    const storedFile = await this.fileStorageService.saveFile(file);

    // 2. 创建文件元数据实体
    const fileMetadata = new FileMetadata({
      originalName: file.originalname,
      storedName: storedFile.storedName,
      filePath: storedFile.filePath,
      fileType: storedFile.fileType,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy,
    });

    // 3. 验证文件类型
    if (!fileMetadata.isAllowedType()) {
      // 删除已上传的文件
      await this.fileStorageService.deleteFile(storedFile.filePath);
      throw new Error(
        `不支持的文件类型: ${fileMetadata.fileType}。仅支持 PDF、EPUB 和图片文件`,
      );
    }

    // 4. 保存文件元数据到数据库
    const savedMetadata = await this.fileMetadataRepository.save(fileMetadata);

    // 5. 转换为 DTO 返回
    return this.toDto(savedMetadata);
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
