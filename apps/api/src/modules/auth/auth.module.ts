import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtStrategy } from './application/services/jwt.strategy';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

/**
 * 认证模块
 *
 * 职责:
 * - 用户认证与授权
 * - JWT Token 管理
 * - 用户信息查询
 */
@Module({
  imports: [
    // Passport 认证库
    PassportModule,
    // JWT 模块配置
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // 应用服务
    AuthService,
    JwtStrategy,
    // 仓储实现 (依赖注入)
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService], // 导出供其他模块使用
})
export class AuthModule {}
