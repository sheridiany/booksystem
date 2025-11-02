/**
 * 图书载体实体 (BookCopy Entity)
 *
 * 代表一本书的具体载体（纸质书或电子书）
 *
 * 设计理念：
 * - 一本书（Book）可以有多个载体（BookCopy）
 * - 纸质书和电子书通过 type 字段区分
 * - 不同类型的载体有各自的验证规则和业务逻辑
 *
 * 核心业务逻辑：
 * - 纸质书：库存管理（借出/归还）
 * - 电子书：文件验证、无库存限制
 * - 状态管理（可用/不可用/维护中）
 */

export enum BookCopyType {
  PHYSICAL = 'PHYSICAL', // 纸质图书
  EBOOK = 'EBOOK',       // 电子图书
}

export enum BookCopyStatus {
  AVAILABLE = 'AVAILABLE',     // 可借阅
  UNAVAILABLE = 'UNAVAILABLE', // 不可借阅
  MAINTENANCE = 'MAINTENANCE', // 维护中
}

export enum EbookFormat {
  PDF = 'pdf',
  EPUB = 'epub',
  MOBI = 'mobi',
}

export class BookCopy {
  id: string;
  bookId: string;
  type: BookCopyType;
  status: BookCopyStatus;

  // 纸质书特有属性
  totalCopies: number | null;
  availableCopies: number | null;
  location: string | null;

  // 电子书特有属性
  ebookFormat: EbookFormat | null;
  fileId: string | null;
  fileSize: number | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    bookId: string;
    type: BookCopyType;
    status?: BookCopyStatus;

    // 纸质书字段（条件必填）
    totalCopies?: number;
    availableCopies?: number;
    location?: string;

    // 电子书字段（条件必填）
    ebookFormat?: EbookFormat;
    fileId?: string;
    fileSize?: number;

    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.bookId = props.bookId;
    this.type = props.type;
    this.status = props.status ?? BookCopyStatus.AVAILABLE;

    // 初始化纸质书字段
    this.totalCopies = props.totalCopies ?? null;
    this.availableCopies = props.availableCopies ?? props.totalCopies ?? null;
    this.location = props.location ?? null;

    // 初始化电子书字段
    this.ebookFormat = props.ebookFormat ?? null;
    this.fileId = props.fileId ?? null;
    this.fileSize = props.fileSize ?? null;

    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    // 根据类型进行验证
    this.validate();
  }

  /**
   * 根据载体类型进行验证
   */
  private validate(): void {
    if (this.type === BookCopyType.PHYSICAL) {
      this.validatePhysicalBook();
    } else if (this.type === BookCopyType.EBOOK) {
      this.validateEbook();
    } else {
      throw new Error(`未知的图书载体类型: ${this.type}`);
    }
  }

  /**
   * 验证纸质书字段
   */
  private validatePhysicalBook(): void {
    // 纸质书必须有库存数量
    if (this.totalCopies === null || this.totalCopies === undefined) {
      throw new Error('纸质图书必须指定总库存数量');
    }

    if (this.totalCopies < 1) {
      throw new Error('纸质图书总库存至少为 1');
    }

    if (this.availableCopies === null || this.availableCopies === undefined) {
      throw new Error('纸质图书必须指定可用库存数量');
    }

    if (this.availableCopies < 0) {
      throw new Error('纸质图书可用库存不能为负数');
    }

    if (this.availableCopies > this.totalCopies) {
      throw new Error('纸质图书可用库存不能大于总库存');
    }

    // 纸质书不应有电子书字段
    if (this.ebookFormat !== null || this.fileId !== null) {
      throw new Error('纸质图书不应设置电子书相关字段');
    }
  }

  /**
   * 验证电子书字段
   */
  private validateEbook(): void {
    // 电子书必须有文件
    if (!this.fileId) {
      throw new Error('电子图书必须上传文件');
    }

    // 电子书必须指定格式
    if (!this.ebookFormat) {
      throw new Error('电子图书必须指定文件格式');
    }

    // 验证格式是否合法
    if (!Object.values(EbookFormat).includes(this.ebookFormat)) {
      throw new Error(`不支持的电子书格式: ${this.ebookFormat}`);
    }

    // 电子书不应有纸质书字段
    if (this.totalCopies !== null || this.availableCopies !== null || this.location !== null) {
      throw new Error('电子图书不应设置纸质书相关字段（库存、位置）');
    }
  }

  /**
   * 借出（仅纸质书需要减库存）
   */
  borrow(): void {
    // 检查状态
    if (this.status !== BookCopyStatus.AVAILABLE) {
      throw new Error(`当前载体状态为 ${this.status}，无法借出`);
    }

    // 电子书无需减库存，直接返回
    if (this.type === BookCopyType.EBOOK) {
      // 电子书借阅不影响状态，可无限并发阅读
      return;
    }

    // 纸质书减库存
    if (this.type === BookCopyType.PHYSICAL) {
      if (!this.availableCopies || this.availableCopies <= 0) {
        throw new Error('纸质图书库存不足，无法借出');
      }

      this.availableCopies -= 1;
      this.updatedAt = new Date();
    }
  }

  /**
   * 归还（仅纸质书需要加库存）
   */
  returnBook(): void {
    // 电子书无需归还操作
    if (this.type === BookCopyType.EBOOK) {
      // 电子书可以记录日志，但不修改状态
      return;
    }

    // 纸质书加库存
    if (this.type === BookCopyType.PHYSICAL) {
      if (!this.totalCopies || !this.availableCopies) {
        throw new Error('数据异常：库存信息缺失');
      }

      if (this.availableCopies >= this.totalCopies) {
        throw new Error('可用库存已满，无法归还（可能重复归还）');
      }

      this.availableCopies += 1;
      this.updatedAt = new Date();
    }
  }

  /**
   * 更新纸质书总库存
   */
  updateTotalCopies(newTotal: number): void {
    if (this.type !== BookCopyType.PHYSICAL) {
      throw new Error('只有纸质图书才能更新库存数量');
    }

    if (newTotal < 1) {
      throw new Error('纸质图书总库存至少为 1');
    }

    const borrowed = (this.totalCopies ?? 0) - (this.availableCopies ?? 0);

    if (newTotal < borrowed) {
      throw new Error(`总库存不能少于已借出数量 (${borrowed})`);
    }

    this.totalCopies = newTotal;
    this.availableCopies = newTotal - borrowed;
    this.updatedAt = new Date();
  }

  /**
   * 更新存放位置（仅纸质书）
   */
  updateLocation(location: string): void {
    if (this.type !== BookCopyType.PHYSICAL) {
      throw new Error('只有纸质图书才有存放位置');
    }

    this.location = location;
    this.updatedAt = new Date();
  }

  /**
   * 更新电子书文件
   */
  updateEbookFile(fileId: string, fileSize?: number): void {
    if (this.type !== BookCopyType.EBOOK) {
      throw new Error('只有电子图书才能更新文件');
    }

    if (!fileId) {
      throw new Error('文件 ID 不能为空');
    }

    this.fileId = fileId;
    if (fileSize !== undefined) {
      this.fileSize = fileSize;
    }
    this.updatedAt = new Date();
  }

  /**
   * 更新状态
   */
  updateStatus(status: BookCopyStatus): void {
    if (!Object.values(BookCopyStatus).includes(status)) {
      throw new Error(`无效的状态: ${status}`);
    }

    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * 设置为不可用
   */
  markAsUnavailable(): void {
    this.updateStatus(BookCopyStatus.UNAVAILABLE);
  }

  /**
   * 设置为可用
   */
  markAsAvailable(): void {
    this.updateStatus(BookCopyStatus.AVAILABLE);
  }

  /**
   * 设置为维护中
   */
  markAsMaintenance(): void {
    this.updateStatus(BookCopyStatus.MAINTENANCE);
  }

  /**
   * 检查是否可借阅
   */
  isAvailable(): boolean {
    if (this.status !== BookCopyStatus.AVAILABLE) {
      return false;
    }

    // 纸质书还需检查库存
    if (this.type === BookCopyType.PHYSICAL) {
      return (this.availableCopies ?? 0) > 0;
    }

    // 电子书只要状态可用即可
    return true;
  }

  /**
   * 检查是否为纸质书
   */
  isPhysical(): boolean {
    return this.type === BookCopyType.PHYSICAL;
  }

  /**
   * 检查是否为电子书
   */
  isEbook(): boolean {
    return this.type === BookCopyType.EBOOK;
  }

  /**
   * 获取已借出数量（仅纸质书）
   */
  getBorrowedCount(): number {
    if (this.type !== BookCopyType.PHYSICAL) {
      return 0;
    }

    return (this.totalCopies ?? 0) - (this.availableCopies ?? 0);
  }

  /**
   * 获取借出率（仅纸质书，0-1）
   */
  getBorrowRate(): number {
    if (this.type !== BookCopyType.PHYSICAL || !this.totalCopies) {
      return 0;
    }

    return this.getBorrowedCount() / this.totalCopies;
  }

  /**
   * 获取可读的类型名称
   */
  getTypeName(): string {
    return this.type === BookCopyType.PHYSICAL ? '纸质图书' : '电子图书';
  }

  /**
   * 获取可读的状态名称
   */
  getStatusName(): string {
    const statusMap: Record<BookCopyStatus, string> = {
      [BookCopyStatus.AVAILABLE]: '可借阅',
      [BookCopyStatus.UNAVAILABLE]: '不可借阅',
      [BookCopyStatus.MAINTENANCE]: '维护中',
    };

    return statusMap[this.status] || '未知状态';
  }
}
