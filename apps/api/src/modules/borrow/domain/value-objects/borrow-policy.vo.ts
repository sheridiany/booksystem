/**
 * 借阅策略值对象 (Borrow Policy Value Object)
 *
 * 定义借阅规则：
 * - 默认借阅天数
 * - 最大续借次数
 * - 续借天数
 */
export class BorrowPolicy {
  /**
   * 默认借阅天数
   */
  readonly defaultBorrowDays: number;

  /**
   * 最大续借次数
   */
  readonly maxRenewCount: number;

  /**
   * 每次续借天数
   */
  readonly renewDays: number;

  constructor(params?: {
    defaultBorrowDays?: number;
    maxRenewCount?: number;
    renewDays?: number;
  }) {
    this.defaultBorrowDays = params?.defaultBorrowDays ?? 30; // 默认30天
    this.maxRenewCount = params?.maxRenewCount ?? 2; // 最多续借2次
    this.renewDays = params?.renewDays ?? 30; // 每次续借30天

    this.validate();
  }

  /**
   * 验证策略参数
   */
  private validate(): void {
    if (this.defaultBorrowDays <= 0) {
      throw new Error('默认借阅天数必须大于0');
    }

    if (this.maxRenewCount < 0) {
      throw new Error('最大续借次数不能为负数');
    }

    if (this.renewDays <= 0) {
      throw new Error('续借天数必须大于0');
    }

    if (this.defaultBorrowDays > 365) {
      throw new Error('默认借阅天数不能超过365天');
    }

    if (this.maxRenewCount > 5) {
      throw new Error('最大续借次数不能超过5次');
    }
  }

  /**
   * 获取默认策略（单例模式）
   */
  static getDefault(): BorrowPolicy {
    return new BorrowPolicy();
  }

  /**
   * 计算最大可借阅天数（初始借阅天数 + 续借天数 * 续借次数）
   */
  getMaxBorrowDays(): number {
    return this.defaultBorrowDays + this.renewDays * this.maxRenewCount;
  }

  /**
   * 值对象相等比较
   */
  equals(other: BorrowPolicy): boolean {
    return (
      this.defaultBorrowDays === other.defaultBorrowDays &&
      this.maxRenewCount === other.maxRenewCount &&
      this.renewDays === other.renewDays
    );
  }
}
