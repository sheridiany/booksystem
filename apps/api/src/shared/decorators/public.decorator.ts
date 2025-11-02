import { SetMetadata } from '@nestjs/common';

/**
 * @Public 装饰器
 *
 * 用于标记无需认证的公开路由
 *
 * 使用示例:
 * @Public()
 * @Get('health')
 * getHealth() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
