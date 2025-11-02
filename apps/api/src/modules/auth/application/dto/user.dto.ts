import { User } from '../../domain/entities/user.entity';

/**
 * 用户响应 DTO
 *
 * 用于向前端返回用户信息 (排除敏感数据如密码)
 */
export interface UserDto {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * UserDto 工厂函数
 */
export function fromEntity(user: User): UserDto {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
}
