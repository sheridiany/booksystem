/**
 * 图书实体 (Book Entity)
 *
 * 核心业务逻辑：
 * - ISBN 验证
 * - 库存管理 (借出/归还)
 * - 状态校验
 */
export class Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  totalCopies: number;
  availableCopies: number;
  coverFileId: string | null;
  contentFileId: string | null;
  description: string | null;
  publishDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    categoryId: string;
    totalCopies: number;
    availableCopies?: number;
    coverFileId?: string | null;
    contentFileId?: string | null;
    description?: string | null;
    publishDate?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.isbn = this.validateISBN(props.isbn);
    this.title = props.title;
    this.author = props.author;
    this.publisher = props.publisher;
    this.categoryId = props.categoryId;
    this.totalCopies = props.totalCopies;
    this.availableCopies = props.availableCopies ?? props.totalCopies;
    this.coverFileId = props.coverFileId ?? null;
    this.contentFileId = props.contentFileId ?? null;
    this.description = props.description ?? null;
    this.publishDate = props.publishDate ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validateCopies();
  }

  /**
   * 验证 ISBN 格式
   * 支持 ISBN-10 和 ISBN-13
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
   * 验证库存数量
   */
  private validateCopies(): void {
    if (this.totalCopies < 0) {
      throw new Error('总库存不能为负数');
    }

    if (this.availableCopies < 0) {
      throw new Error('可用库存不能为负数');
    }

    if (this.availableCopies > this.totalCopies) {
      throw new Error('可用库存不能大于总库存');
    }
  }

  /**
   * 借出图书 (减少可用库存)
   */
  borrow(): void {
    if (this.availableCopies <= 0) {
      throw new Error('图书库存不足，无法借出');
    }

    this.availableCopies -= 1;
    this.updatedAt = new Date();
  }

  /**
   * 归还图书 (增加可用库存)
   */
  returnBook(): void {
    if (this.availableCopies >= this.totalCopies) {
      throw new Error('可用库存已满，无法归还');
    }

    this.availableCopies += 1;
    this.updatedAt = new Date();
  }

  /**
   * 更新总库存 (同时调整可用库存)
   */
  updateTotalCopies(newTotal: number): void {
    if (newTotal < 0) {
      throw new Error('总库存不能为负数');
    }

    const borrowed = this.totalCopies - this.availableCopies;

    if (newTotal < borrowed) {
      throw new Error(`总库存不能少于已借出数量 (${borrowed})`);
    }

    this.totalCopies = newTotal;
    this.availableCopies = newTotal - borrowed;
    this.updatedAt = new Date();
  }

  /**
   * 更新基本信息
   */
  updateInfo(params: {
    title?: string;
    author?: string;
    publisher?: string;
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
   * 更新内容文件
   */
  updateContentFile(fileId: string | null): void {
    this.contentFileId = fileId;
    this.updatedAt = new Date();
  }

  /**
   * 检查是否有库存
   */
  hasAvailableCopies(): boolean {
    return this.availableCopies > 0;
  }

  /**
   * 检查是否有封面
   */
  hasCover(): boolean {
    return this.coverFileId !== null;
  }

  /**
   * 检查是否有内容文件
   */
  hasContentFile(): boolean {
    return this.contentFileId !== null;
  }

  /**
   * 获取已借出数量
   */
  getBorrowedCount(): number {
    return this.totalCopies - this.availableCopies;
  }

  /**
   * 获取借出率 (0-1)
   */
  getBorrowRate(): number {
    if (this.totalCopies === 0) {
      return 0;
    }

    return this.getBorrowedCount() / this.totalCopies;
  }
}
