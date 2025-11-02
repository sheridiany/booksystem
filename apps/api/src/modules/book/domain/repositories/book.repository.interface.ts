import { Book } from '../entities/book.entity';

/**
 * 图书仓储接口
 *
 * 定义图书数据访问的契约
 */
export interface IBookRepository {
  /**
   * 保存图书 (创建或更新)
   */
  save(book: Book): Promise<Book>;

  /**
   * 根据 ID 查找图书
   */
  findById(id: string): Promise<Book | null>;

  /**
   * 根据 ISBN 查找图书
   */
  findByISBN(isbn: string): Promise<Book | null>;

  /**
   * 查找所有图书 (支持分页和过滤)
   */
  findAll(params?: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    search?: string; // 搜索标题、作者、ISBN
  }): Promise<{
    items: Book[];
    total: number;
  }>;

  /**
   * 根据分类查找图书
   */
  findByCategoryId(categoryId: string): Promise<Book[]>;

  /**
   * 删除图书
   */
  delete(id: string): Promise<void>;

  /**
   * 检查 ISBN 是否已存在
   */
  existsByISBN(isbn: string, excludeId?: string): Promise<boolean>;

  /**
   * 检查图书是否被借阅
   */
  hasActiveBorrows(id: string): Promise<boolean>;

  /**
   * 获取热门图书 (按借阅次数排序)
   */
  findPopular(limit?: number): Promise<Book[]>;
}

/**
 * 依赖注入 Token
 */
export const BOOK_REPOSITORY = 'IBookRepository';
