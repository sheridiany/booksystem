import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@/modules/auth/domain/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 角色权限守卫
 *
 * 职责:
 * - 检查用户是否拥有访问权限
 * - 配合 @Roles() 装饰器使用
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由所需的角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // 没有角色限制,允许访问
    }

    // 从请求中获取用户信息 (由 JwtAuthGuard 注入)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // 未登录
    }

    // 检查用户角色是否匹配
    return requiredRoles.some((role) => user.role === role);
  }
}
