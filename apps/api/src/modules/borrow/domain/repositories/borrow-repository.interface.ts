import { BorrowRecord, BorrowStatus } from '../entities/borrow-record.entity';

/**
 * 借阅仓储接口的 DI Token
 */
export const BORROW_REPOSITORY = 'BORROW_REPOSITORY';

/**
 * 借阅仓储接口
 * 定义借阅记录领域模型的持久化操作
 */
export interface IBorrowRepository {
  /**
   * 保存借阅记录（创建或更新）
   */
  save(borrowRecord: BorrowRecord): Promise<BorrowRecord>;

  /**
   * 根据 ID 查找借阅记录
   */
  findById(id: string): Promise<BorrowRecord | null>;

  /**
   * 查找所有借阅记录（分页）
   */
  findAll(params: {
    page?: number;
    pageSize?: number;
    readerId?: string;
    bookId?: string;
    status?: BorrowStatus;
  }): Promise<{
    items: BorrowRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>;

  /**
   * 根据读者ID查找借阅记录
   */
  findByReaderId(readerId: string, status?: BorrowStatus): Promise<BorrowRecord[]>;

  /**
   * 根据图书ID查找借阅记录
   */
  findByBookId(bookId: string, status?: BorrowStatus): Promise<BorrowRecord[]>;

  /**
   * 查找逾期记录
   */
  findOverdue(limit?: number): Promise<BorrowRecord[]>;

  /**
   * 统计读者当前借阅数量（未归还）
   */
  countActiveByReader(readerId: string): Promise<number>;

  /**
   * 检查读者是否有逾期图书
   */
  hasOverdueByReader(readerId: string): Promise<boolean>;

  /**
   * 检查图书是否有未归还的借阅记录
   */
  hasActiveByBook(bookId: string): Promise<boolean>;

  /**
   * 统计借阅数量
   */
  count(params?: {
    readerId?: string;
    bookId?: string;
    status?: BorrowStatus;
  }): Promise<number>;

  /**
   * 删除借阅记录（慎用，一般不删除历史记录）
   */
  delete(id: string): Promise<void>;

  /**
   * 批量更新逾期状态（定时任务使用）
   */
  updateOverdueStatus(): Promise<number>;
}
