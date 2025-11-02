import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service - 数据库连接服务
 *
 * 职责:
 * - 管理 Prisma Client 生命周期
 * - 提供全局数据库访问接口
 * - 处理数据库连接和断开
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // 开发环境启用日志
    });
  }

  /**
   * 模块初始化时连接数据库
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ 数据库连接成功');
  }

  /**
   * 模块销毁时断开数据库连接
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ 数据库连接已断开');
  }

  /**
   * 清理数据库 (仅用于测试环境)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('不允许在生产环境清理数据库');
    }

    // 按照外键依赖顺序删除
    await this.borrowRecord.deleteMany({});
    await this.reader.deleteMany({});
    await this.book.deleteMany({});
    await this.category.deleteMany({});
    await this.fileMetadata.deleteMany({});
    await this.user.deleteMany({});
  }
}
