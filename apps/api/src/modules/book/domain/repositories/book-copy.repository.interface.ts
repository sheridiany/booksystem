import { BookCopy, BookCopyType, BookCopyStatus } from '../entities/book-copy.entity';

/**
 * 图书载体仓储接口
 *
 * 定义图书载体数据访问的契约
 */
export interface IBookCopyRepository {
  /**
   * 保存图书载体 (创建或更新)
   */
  save(bookCopy: BookCopy): Promise<BookCopy>;

  /**
   * 根据 ID 查找图书载体
   */
  findById(id: string): Promise<BookCopy | null>;

  /**
   * 根据图书 ID 查找所有载体
   */
  findByBookId(bookId: string): Promise<BookCopy[]>;

  /**
   * 根据图书 ID 和类型查找载体
   */
  findByBookIdAndType(bookId: string, type: BookCopyType): Promise<BookCopy[]>;

  /**
   * 查找可借阅的载体
   * - 纸质书：状态为 AVAILABLE 且 availableCopies > 0
   * - 电子书：状态为 AVAILABLE
   */
  findAvailableByBookIdAndType(
    bookId: string,
    type: BookCopyType,
  ): Promise<BookCopy[]>;

  /**
   * 查找所有图书载体 (支持分页和过滤)
   */
  findAll(params?: {
    page?: number;
    pageSize?: number;
    bookId?: string;
    type?: BookCopyType;
    status?: BookCopyStatus;
  }): Promise<{
    items: BookCopy[];
    total: number;
  }>;

  /**
   * 删除图书载体
   */
  delete(id: string): Promise<void>;

  /**
   * 检查载体是否有活跃借阅记录
   */
  hasActiveBorrows(id: string): Promise<boolean>;

  /**
   * 批量删除指定图书的所有载体
   */
  deleteByBookId(bookId: string): Promise<void>;

  /**
   * 更新载体状态
   */
  updateStatus(id: string, status: BookCopyStatus): Promise<void>;

  /**
   * 统计指定图书的载体数量（按类型分组）
   */
  countByBookId(bookId: string): Promise<{
    physical: number;
    ebook: number;
    total: number;
  }>;

  /**
   * 获取所有纸质书的总库存和可用库存（聚合统计）
   */
  getTotalPhysicalInventory(): Promise<{
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
  }>;
}

/**
 * 依赖注入 Token
 */
export const BOOK_COPY_REPOSITORY = 'IBookCopyRepository';
