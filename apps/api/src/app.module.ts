import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { FileModule } from './modules/file/file.module';
import { CategoryModule } from './modules/category/category.module';
import { BookModule } from './modules/book/book.module';
import { ReaderModule } from './modules/reader/reader.module';
import { BorrowModule } from './modules/borrow/borrow.module';

@Module({
  imports: [
    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 全局数据库模块
    PrismaModule,
    // 认证模块
    AuthModule,
    // 文件管理模块
    FileModule,
    // 分类管理模块
    CategoryModule,
    // 图书管理模块
    BookModule,
    // 读者管理模块
    ReaderModule,
    // 借阅管理模块
    BorrowModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局响应拦截器 (统一响应格式)
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 全局异常过滤器 (统一错误格式)
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局 JWT 认证守卫 (所有路由默认需要认证,除非使用 @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局角色守卫 (配合 @Roles() 使用)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
