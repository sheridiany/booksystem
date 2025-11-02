import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto, LoginResponseDto } from '../../application/dto/login.dto';
import { UserDto } from '../../application/dto/user.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { Public } from '@/shared/decorators/public.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

/**
 * 认证控制器
 *
 * 端点:
 * - POST /auth/login   - 用户登录 (公开)
 * - GET  /auth/me      - 获取当前用户信息 (需认证)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   *
   * @Public 装饰器标记为公开路由,无需认证
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * 获取当前用户信息
   *
   * 需要 JWT 认证,使用 @CurrentUser 装饰器注入用户信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: UserDto): Promise<UserDto> {
    return user;
  }
}
