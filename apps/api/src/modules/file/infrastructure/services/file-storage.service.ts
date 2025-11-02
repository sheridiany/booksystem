/**
 * FileStorageService - 文件存储服务
 *
 * 职责:
 * - 处理文件的本地存储操作
 * - 生成唯一的文件存储名称
 * - 根据文件类型组织存储目录
 * - 提供文件删除功能
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileType, FileTypeEnum } from '../../domain/value-objects/file-type.vo';

export interface StoredFileInfo {
  storedName: string;
  filePath: string;
  fileType: FileTypeEnum;
}

@Injectable()
export class FileStorageService {
  private readonly uploadBasePath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadBasePath =
      this.configService.get<string>('UPLOAD_PATH') || './uploads';
  }

  /**
   * 保存文件到本地存储
   */
  async saveFile(file: Express.Multer.File): Promise<StoredFileInfo> {
    // 1. 确定文件类型
    const fileType = FileType.fromMimeType(file.mimetype);

    // 2. 生成唯一的存储文件名
    const extension = this.getExtension(file.originalname);
    const storedName = `${uuidv4()}${extension}`;

    // 3. 确定存储目录 (根据文件类型分类)
    const typeDir = this.getTypeDirName(fileType.type);
    const storageDir = path.join(this.uploadBasePath, typeDir);

    // 4. 确保目录存在
    await this.ensureDirectoryExists(storageDir);

    // 5. 写入文件
    const filePath = path.join(storageDir, storedName);
    await fs.writeFile(filePath, file.buffer);

    return {
      storedName,
      filePath: path.relative(process.cwd(), filePath), // 返回相对路径
      fileType: fileType.type,
    };
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      await fs.unlink(absolutePath);
    } catch (error) {
      // 文件不存在时忽略错误
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      await fs.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 读取文件内容
   */
  async readFile(filePath: string): Promise<Buffer> {
    const absolutePath = path.join(process.cwd(), filePath);
    return await fs.readFile(absolutePath);
  }

  /**
   * 获取文件扩展名
   */
  private getExtension(filename: string): string {
    const ext = path.extname(filename);
    return ext || '';
  }

  /**
   * 根据文件类型获取目录名
   */
  private getTypeDirName(fileType: FileTypeEnum): string {
    const dirMap: Record<FileTypeEnum, string> = {
      [FileTypeEnum.PDF]: 'pdf',
      [FileTypeEnum.EPUB]: 'epub',
      [FileTypeEnum.IMAGE]: 'image',
      [FileTypeEnum.OTHER]: 'other',
    };
    return dirMap[fileType];
  }

  /**
   * 确保目录存在，不存在则创建
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}
