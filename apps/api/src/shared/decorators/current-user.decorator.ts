import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser 装饰器
 *
 * 用于在控制器中直接获取当前登录用户信息
 *
 * 使用示例:
 * @Get('me')
 * getCurrentUser(@CurrentUser() user: UserDto) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
