/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'ADMIN', // 管理员
  READER = 'READER', // 读者
}

/**
 * User 实体 - 认证领域
 *
 * 职责:
 * - 用户认证信息管理
 * - 角色权限判断
 * - 登录状态维护
 *
 * DDD 原则:
 * - 实体封装业务逻辑,避免贫血模型
 * - 密码加密由应用层处理 (bcrypt)
 */
export class User {
  private readonly _id: string;
  private _username: string;
  private _passwordHash: string;
  private _role: UserRole;
  private _isActive: boolean;
  private _lastLoginAt?: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    username: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._username = props.username;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._isActive = props.isActive;
    this._lastLoginAt = props.lastLoginAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // ========== Getters ==========

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get role(): UserRole {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ========== 领域行为 ==========

  /**
   * 判断是否为管理员
   */
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  /**
   * 判断是否为读者
   */
  isReader(): boolean {
    return this._role === UserRole.READER;
  }

  /**
   * 判断是否拥有指定角色
   */
  hasRole(role: UserRole): boolean {
    return this._role === role;
  }

  /**
   * 更新最后登录时间
   */
  updateLastLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 停用账号
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * 激活账号
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * 修改密码 (接收已加密的密码哈希)
   */
  changePassword(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  // ========== 工厂方法 ==========

  /**
   * 创建新用户 (用于注册场景)
   */
  static create(props: {
    username: string;
    passwordHash: string;
    role: UserRole;
  }): User {
    const now = new Date();
    return new User({
      id: crypto.randomUUID(), // 生成 UUID
      username: props.username,
      passwordHash: props.passwordHash,
      role: props.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ========== 数据转换 ==========

  /**
   * 转换为普通对象 (用于持久化)
   */
  toPlainObject(): {
    id: string;
    username: string;
    passwordHash: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      username: this._username,
      passwordHash: this._passwordHash,
      role: this._role,
      isActive: this._isActive,
      lastLoginAt: this._lastLoginAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
