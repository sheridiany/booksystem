/**
 * FileType Value Object - 文件类型值对象
 *
 * 职责:
 * - 封装文件类型及其验证规则
 * - 定义允许的文件类型和 MIME 类型
 * - 确保文件类型的合法性
 */

export enum FileTypeEnum {
  PDF = 'pdf',
  EPUB = 'epub',
  IMAGE = 'image',
  OTHER = 'other',
}

export class FileType {
  private static readonly ALLOWED_TYPES: Record<
    FileTypeEnum,
    { extensions: string[]; mimeTypes: string[] }
  > = {
    [FileTypeEnum.PDF]: {
      extensions: ['.pdf'],
      mimeTypes: ['application/pdf'],
    },
    [FileTypeEnum.EPUB]: {
      extensions: ['.epub'],
      mimeTypes: ['application/epub+zip'],
    },
    [FileTypeEnum.IMAGE]: {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },
    [FileTypeEnum.OTHER]: {
      extensions: [],
      mimeTypes: [],
    },
  };

  private constructor(
    private readonly _type: FileTypeEnum,
    private readonly _mimeType: string,
  ) {}

  get type(): FileTypeEnum {
    return this._type;
  }

  get mimeType(): string {
    return this._mimeType;
  }

  /**
   * 根据 MIME 类型创建文件类型
   */
  static fromMimeType(mimeType: string): FileType {
    for (const [type, config] of Object.entries(FileType.ALLOWED_TYPES)) {
      if (config.mimeTypes.includes(mimeType)) {
        return new FileType(type as FileTypeEnum, mimeType);
      }
    }
    return new FileType(FileTypeEnum.OTHER, mimeType);
  }

  /**
   * 根据文件扩展名创建文件类型
   */
  static fromExtension(extension: string): FileType {
    const normalizedExt = extension.toLowerCase();
    for (const [type, config] of Object.entries(FileType.ALLOWED_TYPES)) {
      if (config.extensions.includes(normalizedExt)) {
        // 使用该类型的第一个 MIME 类型作为默认值
        const mimeType = config.mimeTypes[0] || 'application/octet-stream';
        return new FileType(type as FileTypeEnum, mimeType);
      }
    }
    return new FileType(FileTypeEnum.OTHER, 'application/octet-stream');
  }

  /**
   * 验证文件类型是否被允许
   */
  isAllowed(): boolean {
    return this._type !== FileTypeEnum.OTHER;
  }

  /**
   * 验证是否为电子书文件 (PDF/EPUB)
   */
  isEbook(): boolean {
    return this._type === FileTypeEnum.PDF || this._type === FileTypeEnum.EPUB;
  }

  /**
   * 验证是否为图片文件
   */
  isImage(): boolean {
    return this._type === FileTypeEnum.IMAGE;
  }

  toString(): string {
    return this._type;
  }
}
