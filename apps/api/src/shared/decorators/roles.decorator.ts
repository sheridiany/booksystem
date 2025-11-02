import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/modules/auth/domain/entities/user.entity';

/**
 * @Roles 装饰器
 *
 * 用于限制路由访问的角色
 *
 * 使用示例:
 * @Roles(UserRole.ADMIN)
 * @Post('books')
 * createBook() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
