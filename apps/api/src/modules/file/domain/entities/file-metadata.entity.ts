/**
 * FileMetadata Entity - 文件元数据实体
 *
 * 职责:
 * - 封装文件元数据的核心业务逻辑
 * - 管理文件的基本信息 (名称、路径、类型、大小等)
 * - 确保文件元数据的一致性和完整性
 */

import { FileType, FileTypeEnum } from '../value-objects/file-type.vo';

export interface FileMetadataProps {
  id?: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileType: FileTypeEnum;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt?: Date;
}

export class FileMetadata {
  private readonly _id?: string;
  private readonly _originalName: string;
  private readonly _storedName: string;
  private readonly _filePath: string;
  private readonly _fileType: FileType;
  private readonly _size: number;
  private readonly _uploadedBy: string;
  private readonly _createdAt: Date;

  constructor(props: FileMetadataProps) {
    this._id = props.id;
    this._originalName = props.originalName;
    this._storedName = props.storedName;
    this._filePath = props.filePath;
    this._fileType = FileType.fromMimeType(props.mimeType);
    this._size = props.size;
    this._uploadedBy = props.uploadedBy;
    this._createdAt = props.createdAt || new Date();

    this.validate();
  }

  /**
   * 验证文件元数据的合法性
   */
  private validate(): void {
    if (!this._originalName || this._originalName.trim().length === 0) {
      throw new Error('文件原始名称不能为空');
    }

    if (!this._storedName || this._storedName.trim().length === 0) {
      throw new Error('文件存储名称不能为空');
    }

    if (!this._filePath || this._filePath.trim().length === 0) {
      throw new Error('文件路径不能为空');
    }

    if (this._size <= 0) {
      throw new Error('文件大小必须大于 0');
    }

    if (!this._uploadedBy || this._uploadedBy.trim().length === 0) {
      throw new Error('上传者不能为空');
    }

    // 文件大小限制: 100MB
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (this._size > MAX_FILE_SIZE) {
      throw new Error(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }

  get originalName(): string {
    return this._originalName;
  }

  get storedName(): string {
    return this._storedName;
  }

  get filePath(): string {
    return this._filePath;
  }

  get fileType(): FileTypeEnum {
    return this._fileType.type;
  }

  get mimeType(): string {
    return this._fileType.mimeType;
  }

  get size(): number {
    return this._size;
  }

  get uploadedBy(): string {
    return this._uploadedBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 检查文件类型是否被允许
   */
  isAllowedType(): boolean {
    return this._fileType.isAllowed();
  }

  /**
   * 检查是否为电子书文件
   */
  isEbook(): boolean {
    return this._fileType.isEbook();
  }

  /**
   * 检查是否为图片文件
   */
  isImage(): boolean {
    return this._fileType.isImage();
  }

  /**
   * 获取文件扩展名
   */
  getExtension(): string {
    return this._originalName.substring(this._originalName.lastIndexOf('.'));
  }

  /**
   * 获取格式化的文件大小
   */
  getFormattedSize(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this._size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * 转换为持久化对象
   */
  toPersistence(): {
    id?: string;
    originalName: string;
    storedName: string;
    filePath: string;
    fileType: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
    createdAt: Date;
  } {
    return {
      id: this._id,
      originalName: this._originalName,
      storedName: this._storedName,
      filePath: this._filePath,
      fileType: this.fileType,
      mimeType: this.mimeType,
      size: this._size,
      uploadedBy: this._uploadedBy,
      createdAt: this._createdAt,
    };
  }

  /**
   * 从持久化对象创建实体
   */
  static fromPersistence(data: {
    id: string;
    originalName: string;
    storedName: string;
    filePath: string;
    fileType: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
    createdAt: Date;
  }): FileMetadata {
    return new FileMetadata({
      id: data.id,
      originalName: data.originalName,
      storedName: data.storedName,
      filePath: data.filePath,
      fileType: data.fileType as FileTypeEnum,
      mimeType: data.mimeType,
      size: data.size,
      uploadedBy: data.uploadedBy,
      createdAt: data.createdAt,
    });
  }
}
