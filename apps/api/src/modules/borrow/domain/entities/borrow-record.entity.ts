/**
 * 借阅记录实体 (BorrowRecord Entity)
 *
 * 核心业务逻辑：
 * - 借阅流程管理
 * - 逾期检测
 * - 续借管理
 * - 状态机转换
 *
 * 变更说明：bookId → bookCopyId
 * 现在借阅记录关联到具体的图书载体，而不是图书元信息
 */

export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export class BorrowRecord {
  id: string;
  bookCopyId: string; // 改为载体ID
  readerId: string;
  borrowDate: Date;
  dueDate: Date | null; // 改为可选：电子书可能无归还日期
  returnDate: Date | null;
  renewCount: number;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    bookCopyId: string; // 改为载体ID
    readerId: string;
    borrowDate?: Date;
    dueDate?: Date | null;
    returnDate?: Date | null;
    renewCount?: number;
    status?: BorrowStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.bookCopyId = props.bookCopyId;
    this.readerId = props.readerId;
    this.borrowDate = props.borrowDate ?? new Date();
    this.dueDate = props.dueDate ?? this.calculateDueDate(30); // 默认30天（纸质书），电子书可能为null
    this.returnDate = props.returnDate ?? null;
    this.renewCount = props.renewCount ?? 0;
    this.status = props.status ?? 'BORROWED';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * 验证借阅记录
   */
  private validate(): void {
    if (!this.bookCopyId) {
      throw new Error('图书载体 ID 不能为空');
    }

    if (!this.readerId) {
      throw new Error('读者 ID 不能为空');
    }

    // 电子书可能没有归还日期
    if (this.dueDate && this.dueDate < this.borrowDate) {
      throw new Error('应还日期不能早于借阅日期');
    }

    if (this.returnDate && this.returnDate < this.borrowDate) {
      throw new Error('归还日期不能早于借阅日期');
    }

    if (this.renewCount < 0) {
      throw new Error('续借次数不能为负数');
    }
  }

  /**
   * 办理借阅（创建时调用）
   */
  static borrow(bookCopyId: string, readerId: string, borrowDays = 30): BorrowRecord {
    const record = new BorrowRecord({
      id: '', // 将由用例层生成 UUID
      bookCopyId,
      readerId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + borrowDays * 24 * 60 * 60 * 1000),
      status: 'BORROWED',
      renewCount: 0,
    });

    return record;
  }

  /**
   * 办理归还
   */
  returnBook(): void {
    if (this.status === 'RETURNED') {
      throw new Error('图书已归还，无法重复归还');
    }

    this.returnDate = new Date();
    this.status = 'RETURNED';
    this.updatedAt = new Date();
  }

  /**
   * 办理续借
   * @param additionalDays 续借天数 (默认30天)
   * @param maxRenewCount 最大续借次数限制 (默认2次)
   */
  renew(additionalDays = 30, maxRenewCount = 2): void {
    // 1. 检查是否已归还
    if (this.status === 'RETURNED') {
      throw new Error('已归还图书无法续借');
    }

    // 2. 检查续借次数
    if (this.renewCount >= maxRenewCount) {
      throw new Error(`续借次数已达上限 (${maxRenewCount} 次)`);
    }

    // 3. 检查是否逾期
    if (this.isOverdue()) {
      throw new Error('逾期图书无法续借，请先归还');
    }

    // 4. 延长应还日期
    const newDueDate = new Date(this.dueDate);
    newDueDate.setDate(newDueDate.getDate() + additionalDays);
    this.dueDate = newDueDate;

    // 5. 增加续借次数
    this.renewCount += 1;
    this.updatedAt = new Date();
  }

  /**
   * 检查并更新逾期状态
   * 应由定时任务或查询时调用
   */
  checkAndUpdateOverdueStatus(): boolean {
    const isOverdue = this.isOverdue();

    if (isOverdue && this.status !== 'RETURNED' && this.status !== 'OVERDUE') {
      this.status = 'OVERDUE';
      this.updatedAt = new Date();
      return true; // 状态已更新
    }

    return false; // 状态未变化
  }

  /**
   * 检查是否逾期
   */
  isOverdue(): boolean {
    // 已归还的不算逾期
    if (this.returnDate) {
      return false;
    }

    // 检查当前时间是否超过应还日期
    return new Date() > this.dueDate;
  }

  /**
   * 检查是否已归还
   */
  isReturned(): boolean {
    return this.status === 'RETURNED';
  }

  /**
   * 检查是否可以续借
   * @param maxRenewCount 最大续借次数限制
   */
  canRenew(maxRenewCount = 2): boolean {
    return (
      this.status !== 'RETURNED' && // 未归还
      this.renewCount < maxRenewCount && // 未达续借上限
      !this.isOverdue() // 未逾期
    );
  }

  /**
   * 计算剩余天数（正数=未到期，负数=已逾期）
   */
  getDaysRemaining(): number {
    if (this.returnDate) {
      return 0; // 已归还
    }

    const now = new Date();
    const diffMs = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }

  /**
   * 计算借阅天数
   */
  getBorrowDays(): number {
    const endDate = this.returnDate || new Date();
    const diffMs = endDate.getTime() - this.borrowDate.getTime();
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }

  /**
   * 计算逾期天数 (0=未逾期或已归还)
   */
  getOverdueDays(): number {
    if (this.returnDate || !this.isOverdue()) {
      return 0;
    }

    const now = new Date();
    const diffMs = now.getTime() - this.dueDate.getTime();
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }

  /**
   * 计算应还日期（从给定日期起）
   */
  private calculateDueDate(days: number, from: Date = new Date()): Date {
    const date = new Date(from);
    date.setDate(date.getDate() + days);
    return date;
  }

  /**
   * 获取状态描述
   */
  getStatusText(): string {
    switch (this.status) {
      case 'BORROWED':
        return '借阅中';
      case 'RETURNED':
        return '已归还';
      case 'OVERDUE':
        return '已逾期';
      default:
        return '未知状态';
    }
  }
}
