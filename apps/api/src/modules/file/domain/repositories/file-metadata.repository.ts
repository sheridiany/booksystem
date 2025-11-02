/**
 * IFileMetadataRepository - 文件元数据仓储接口
 *
 * 职责:
 * - 定义文件元数据的持久化操作接口
 * - 隔离领域层和基础设施层的依赖
 * - 遵循 DDD 仓储模式
 */

import { FileMetadata } from '../entities/file-metadata.entity';

export interface IFileMetadataRepository {
  /**
   * 保存文件元数据
   */
  save(fileMetadata: FileMetadata): Promise<FileMetadata>;

  /**
   * 根据 ID 查找文件元数据
   */
  findById(id: string): Promise<FileMetadata | null>;

  /**
   * 根据存储名称查找文件元数据
   */
  findByStoredName(storedName: string): Promise<FileMetadata | null>;

  /**
   * 查找用户上传的所有文件
   */
  findByUploadedBy(uploadedBy: string): Promise<FileMetadata[]>;

  /**
   * 删除文件元数据
   */
  delete(id: string): Promise<void>;

  /**
   * 检查文件是否存在
   */
  exists(id: string): Promise<boolean>;
}

export const IFileMetadataRepository = Symbol('IFileMetadataRepository');
