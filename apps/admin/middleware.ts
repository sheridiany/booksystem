import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 路由守卫 Middleware
 *
 * 功能:
 * - 保护需要认证的路由
 * - 未登录用户自动跳转到登录页
 * - 已登录用户访问登录页自动跳转到首页
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 从 cookie 中获取 token
  const token = request.cookies.get('token')?.value;

  // 同时检查 localStorage (通过请求头传递)
  // 注意: middleware 无法直接访问 localStorage,需要客户端配合
  // 这里主要依赖 cookie 或请求头中的 Authorization

  const authHeader = request.headers.get('authorization');
  const hasToken = token || authHeader?.startsWith('Bearer ');

  // 公开路由列表 (无需登录即可访问)
  const publicRoutes = ['/login'];

  // 检查是否为公开路由
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 未登录且访问受保护路由 -> 跳转登录页
  if (!hasToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // 保存原始访问路径,登录后跳转回去
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录且访问登录页 -> 跳转首页
  if (hasToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher 配置
 *
 * 排除不需要守卫的路径:
 * - /api 路由
 * - /_next 静态资源
 * - /favicon.ico 等静态文件
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
