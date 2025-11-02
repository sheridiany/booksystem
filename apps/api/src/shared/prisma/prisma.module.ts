import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma Module - 全局数据库模块
 *
 * @Global 装饰器使该模块成为全局模块,
 * 其他模块无需显式导入即可使用 PrismaService
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
