import { User } from '../entities/user.entity';

/**
 * 用户仓储接口
 *
 * DDD 原则:
 * - 领域层定义接口,基础设施层实现
 * - 仓储负责领域对象的持久化和查询
 * - 避免领域层直接依赖技术实现 (Prisma)
 */
export interface IUserRepository {
  /**
   * 保存用户 (创建或更新)
   */
  save(user: User): Promise<User>;

  /**
   * 根据ID查找用户
   */
  findById(id: string): Promise<User | null>;

  /**
   * 根据用户名查找用户
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * 删除用户
   */
  delete(id: string): Promise<void>;

  /**
   * 查找所有用户 (分页)
   */
  findAll(params: {
    page: number;
    limit: number;
  }): Promise<{ users: User[]; total: number }>;

  /**
   * 检查用户名是否存在
   */
  existsByUsername(username: string): Promise<boolean>;
}

/**
 * 用户仓储令牌 (用于依赖注入)
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
