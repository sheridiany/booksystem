import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

/**
 * JWT 认证策略
 *
 * 职责:
 * - 从请求中提取 JWT Token
 * - 验证 Token 有效性
 * - 解析 Token 中的用户信息
 * - 将用户信息注入到 Request 对象
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 Authorization Header 提取
      ignoreExpiration: false, // 不忽略过期
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  /**
   * 验证 JWT Payload
   *
   * @param payload JWT 解析后的 Payload
   * @returns 用户信息 (将注入到 req.user)
   */
  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token 无效或用户已被停用');
    }

    return user; // 将被注入到 Request.user
  }
}
