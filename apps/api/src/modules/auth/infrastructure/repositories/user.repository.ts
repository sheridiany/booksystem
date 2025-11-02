import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User, UserRole } from '../../domain/entities/user.entity';

/**
 * 用户仓储实现 (Prisma)
 *
 * 职责:
 * - 实现 IUserRepository 接口
 * - 处理领域对象与数据库模型的转换
 * - 封装 Prisma 数据库操作
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 保存用户 (Upsert 模式)
   */
  async save(user: User): Promise<User> {
    const data = {
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // openGauss 不支持 upsert,使用 findUnique + create/update
    const existing = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    const savedUser = existing
      ? await this.prisma.user.update({
          where: { id: user.id },
          data,
        })
      : await this.prisma.user.create({ data });

    return this.toDomain(savedUser);
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomain(user) : null;
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    return user ? this.toDomain(user) : null;
  }

  /**
   * 删除用户
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 查找所有用户 (分页)
   */
  async findAll(params: {
    page: number;
    limit: number;
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map((u) => this.toDomain(u)),
      total,
    };
  }

  /**
   * 检查用户名是否存在
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { username },
    });
    return count > 0;
  }

  // ========== 私有方法: 数据转换 ==========

  /**
   * Prisma 模型转领域实体
   */
  private toDomain(prismaUser: any): User {
    return new User({
      id: prismaUser.id,
      username: prismaUser.username,
      passwordHash: prismaUser.passwordHash,
      role: prismaUser.role as UserRole,
      isActive: prismaUser.isActive,
      lastLoginAt: prismaUser.lastLoginAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
