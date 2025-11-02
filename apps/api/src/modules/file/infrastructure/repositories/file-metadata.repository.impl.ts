/**
 * FileMetadataRepositoryImpl - 文件元数据仓储实现
 *
 * 职责:
 * - 实现 IFileMetadataRepository 接口
 * - 使用 Prisma 进行数据库操作
 * - 处理领域实体与持久化模型的转换
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { FileMetadata } from '../../domain/entities/file-metadata.entity';
import { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository';

@Injectable()
export class FileMetadataRepositoryImpl implements IFileMetadataRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(fileMetadata: FileMetadata): Promise<FileMetadata> {
    const data = fileMetadata.toPersistence();

    const savedData = await this.prisma.fileMetadata.upsert({
      where: { id: data.id || '' },
      create: {
        originalName: data.originalName,
        storedName: data.storedName,
        filePath: data.filePath,
        fileType: data.fileType,
        mimeType: data.mimeType,
        size: data.size,
        uploadedBy: data.uploadedBy,
      },
      update: {
        originalName: data.originalName,
        storedName: data.storedName,
        filePath: data.filePath,
        fileType: data.fileType,
        mimeType: data.mimeType,
        size: data.size,
        uploadedBy: data.uploadedBy,
      },
    });

    return FileMetadata.fromPersistence(savedData);
  }

  async findById(id: string): Promise<FileMetadata | null> {
    const data = await this.prisma.fileMetadata.findUnique({
      where: { id },
    });

    return data ? FileMetadata.fromPersistence(data) : null;
  }

  async findByStoredName(storedName: string): Promise<FileMetadata | null> {
    const data = await this.prisma.fileMetadata.findFirst({
      where: { storedName },
    });

    return data ? FileMetadata.fromPersistence(data) : null;
  }

  async findByUploadedBy(uploadedBy: string): Promise<FileMetadata[]> {
    const dataList = await this.prisma.fileMetadata.findMany({
      where: { uploadedBy },
      orderBy: { createdAt: 'desc' },
    });

    return dataList.map((data) => FileMetadata.fromPersistence(data));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fileMetadata.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.fileMetadata.count({
      where: { id },
    });

    return count > 0;
  }
}
