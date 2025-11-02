/**
 * 读者实体 (Reader Entity)
 *
 * 核心业务逻辑：
 * - 读者状态管理 (激活/禁用)
 * - 借阅资格校验
 * - 借阅上限管理
 */
export class Reader {
  id: string;
  userId: string;
  name: string;
  studentId: string | null;
  phone: string | null;
  email: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  maxBorrowLimit: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    name: string;
    studentId?: string | null;
    phone?: string | null;
    email?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
    maxBorrowLimit?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.studentId = props.studentId ?? null;
    this.phone = props.phone ?? null;
    this.email = props.email ?? null;
    this.status = props.status ?? 'ACTIVE';
    this.maxBorrowLimit = props.maxBorrowLimit ?? 5;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * 验证读者信息
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('读者姓名不能为空');
    }

    if (this.maxBorrowLimit < 0) {
      throw new Error('借阅上限不能为负数');
    }

    if (this.maxBorrowLimit > 20) {
      throw new Error('借阅上限不能超过 20 本');
    }

    // 验证邮箱格式
    if (this.email && !this.isValidEmail(this.email)) {
      throw new Error('邮箱格式不正确');
    }

    // 验证手机号格式 (中国大陆手机号)
    if (this.phone && !this.isValidPhone(this.phone)) {
      throw new Error('手机号格式不正确');
    }
  }

  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 激活读者
   */
  activate(): void {
    if (this.status === 'ACTIVE') {
      throw new Error('读者已处于激活状态');
    }
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  /**
   * 禁用读者
   * 注意：禁用前需要确保没有未归还的图书（由领域服务或用例处理）
   */
  deactivate(): void {
    if (this.status === 'INACTIVE') {
      throw new Error('读者已处于禁用状态');
    }
    this.status = 'INACTIVE';
    this.updatedAt = new Date();
  }

  /**
   * 检查是否可以借书
   */
  canBorrow(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * 检查是否激活
   */
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * 更新基本信息
   */
  updateInfo(params: {
    name?: string;
    studentId?: string | null;
    phone?: string | null;
    email?: string | null;
    maxBorrowLimit?: number;
  }): void {
    if (params.name !== undefined) {
      if (!params.name || params.name.trim().length === 0) {
        throw new Error('读者姓名不能为空');
      }
      this.name = params.name.trim();
    }

    if (params.studentId !== undefined) {
      this.studentId = params.studentId?.trim() || null;
    }

    if (params.phone !== undefined) {
      const phone = params.phone?.trim() || null;
      if (phone && !this.isValidPhone(phone)) {
        throw new Error('手机号格式不正确');
      }
      this.phone = phone;
    }

    if (params.email !== undefined) {
      const email = params.email?.trim() || null;
      if (email && !this.isValidEmail(email)) {
        throw new Error('邮箱格式不正确');
      }
      this.email = email;
    }

    if (params.maxBorrowLimit !== undefined) {
      if (params.maxBorrowLimit < 0) {
        throw new Error('借阅上限不能为负数');
      }
      if (params.maxBorrowLimit > 20) {
        throw new Error('借阅上限不能超过 20 本');
      }
      this.maxBorrowLimit = params.maxBorrowLimit;
    }

    this.updatedAt = new Date();
  }

  /**
   * 检查是否有联系方式
   */
  hasContactInfo(): boolean {
    return !!(this.phone || this.email);
  }

  /**
   * 获取显示名称（优先使用姓名，其次学号）
   */
  getDisplayName(): string {
    if (this.studentId) {
      return `${this.name} (${this.studentId})`;
    }
    return this.name;
  }
}
