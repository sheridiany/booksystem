import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import { UserDto, fromEntity } from '../dto/user.dto';

/**
 * 认证服务
 *
 * 职责:
 * - 处理用户登录逻辑
 * - 密码验证
 * - JWT Token 生成
 * - 用户信息查询
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   *
   * @param loginDto 登录凭证
   * @returns JWT Token 和用户信息
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // 1. 根据用户名查找用户
    const user = await this.userRepository.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 2. 验证密码
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. 检查账号状态
    if (!user.isActive) {
      throw new UnauthorizedException('账号已被停用');
    }

    // 4. 更新最后登录时间
    user.updateLastLogin();
    await this.userRepository.save(user);

    // 5. 生成 JWT Token
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // 6. 返回登录响应
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * 验证 JWT Token 并返回用户信息
   *
   * @param userId 用户ID (从JWT解析)
   * @returns 用户信息
   */
  async validateUser(userId: string): Promise<UserDto | null> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }

    return fromEntity(user);
  }

  /**
   * 获取当前用户信息
   *
   * @param userId 用户ID
   * @returns 用户信息
   */
  async getCurrentUser(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return fromEntity(user);
  }

  /**
   * 加密密码 (工具方法,供其他模块使用)
   *
   * @param password 明文密码
   * @returns 加密后的密码哈希
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
