/**
 * 图书实体 (Book Entity)
 *
 * 代表图书的元信息（书名、作者、出版社等）
 *
 * 设计变更说明：
 * - 职责简化：仅负责图书元信息管理
 * - 库存管理已移至 BookCopy 实体
 * - 一本书可以有多个载体（纸质书、电子书）
 *
 * 核心业务逻辑：
 * - ISBN 验证（可选，电子资源可能无 ISBN）
 * - 基本信息管理
 * - 分类管理
 */
export class Book {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  coverFileId: string | null;
  description: string | null;
  publishDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    isbn?: string | null;
    title: string;
    author: string;
    publisher: string;
    categoryId: string;
    coverFileId?: string | null;
    description?: string | null;
    publishDate?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.isbn = props.isbn ? this.validateISBN(props.isbn) : null;
    this.title = props.title;
    this.author = props.author;
    this.publisher = props.publisher;
    this.categoryId = props.categoryId;
    this.coverFileId = props.coverFileId ?? null;
    this.description = props.description ?? null;
    this.publishDate = props.publishDate ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * 验证 ISBN 格式
   * 支持 ISBN-10 和 ISBN-13
   * 注意：ISBN 现在是可选的（电子资源可能无 ISBN）
   */
  private validateISBN(isbn: string): string {
    const cleaned = isbn.replace(/[-\s]/g, '');

    if (cleaned.length !== 10 && cleaned.length !== 13) {
      throw new Error('ISBN 必须是 10 位或 13 位');
    }

    if (!/^\d+$/.test(cleaned)) {
      throw new Error('ISBN 只能包含数字');
    }

    return cleaned;
  }

  /**
   * 更新基本信息
   */
  updateInfo(params: {
    title?: string;
    author?: string;
    publisher?: string;
    isbn?: string | null;
    description?: string;
    publishDate?: Date | null;
  }): void {
    if (params.title !== undefined) {
      if (!params.title || params.title.trim().length === 0) {
        throw new Error('图书标题不能为空');
      }
      this.title = params.title.trim();
    }

    if (params.author !== undefined) {
      if (!params.author || params.author.trim().length === 0) {
        throw new Error('作者不能为空');
      }
      this.author = params.author.trim();
    }

    if (params.publisher !== undefined) {
      if (!params.publisher || params.publisher.trim().length === 0) {
        throw new Error('出版社不能为空');
      }
      this.publisher = params.publisher.trim();
    }

    if (params.isbn !== undefined) {
      this.isbn = params.isbn ? this.validateISBN(params.isbn) : null;
    }

    if (params.description !== undefined) {
      this.description = params.description?.trim() || null;
    }

    if (params.publishDate !== undefined) {
      this.publishDate = params.publishDate;
    }

    this.updatedAt = new Date();
  }

  /**
   * 更新分类
   */
  updateCategory(categoryId: string): void {
    if (!categoryId) {
      throw new Error('分类 ID 不能为空');
    }

    this.categoryId = categoryId;
    this.updatedAt = new Date();
  }

  /**
   * 更新封面文件
   */
  updateCoverFile(fileId: string | null): void {
    this.coverFileId = fileId;
    this.updatedAt = new Date();
  }

  /**
   * 检查是否有封面
   */
  hasCover(): boolean {
    return this.coverFileId !== null;
  }

  /**
   * 检查是否有 ISBN
   */
  hasISBN(): boolean {
    return this.isbn !== null;
  }
}
