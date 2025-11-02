import { User } from '../../domain/entities/user.entity';

/**
 * 用户响应 DTO
 *
 * 用于向前端返回用户信息 (排除敏感数据如密码)
 */
export class UserDto {
  id!: string;
  username!: string;
  role!: string;
  isActive!: boolean;
  lastLoginAt?: string;
  createdAt!: string;

  /**
   * 从领域实体转换为 DTO
   */
  static fromEntity(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.lastLoginAt = user.lastLoginAt?.toISOString();
    dto.createdAt = user.createdAt.toISOString();
    return dto;
  }
}
