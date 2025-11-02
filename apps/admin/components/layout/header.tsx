'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { navigation } from '@/lib/config/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Header() {
  const pathname = usePathname();

  // 判断当前路由是否激活
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="flex h-14 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-4 lg:mr-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <span className="text-base font-bold">书</span>
          </div>
          <span className="text-base font-semibold hidden lg:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            众慧图书管理系统
          </span>
        </div>

        {/* 导航菜单 */}
        <nav className="flex items-center gap-0.5 lg:gap-1 flex-1">
          {navigation.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-all duration-200',
                  'hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm',
                  isActive(item.href)
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground'
                )}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                <span>{item.title}</span>
                {item.children && (
                  <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-hover:rotate-180" />
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground font-semibold shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* 下拉菜单 */}
              {item.children && (
                <div className="absolute left-0 top-full pt-1.5 hidden group-hover:block">
                  <div className="w-48 rounded-lg border bg-popover/95 backdrop-blur-sm p-1 shadow-xl animate-in fade-in-0 zoom-in-95">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-md transition-all duration-150',
                          'hover:bg-accent/80 hover:text-accent-foreground hover:pl-4',
                          pathname === child.href
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-foreground'
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span>{child.title}</span>
                          {child.badge !== undefined && child.badge > 0 && (
                            <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground font-semibold">
                              {child.badge}
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {/* 通知图标 */}
          <button
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200"
            title="通知"
          >
            <Bell className="h-4 w-4" />
            {/* 未读通知数量徽章 */}
            <span className="absolute right-0.5 top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive shadow-sm"></span>
            </span>
          </button>

          {/* 主题切换按钮 */}
          <ThemeToggle />

          {/* 用户菜单 */}
          <div className="relative group">
            <button className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-sm">
                管
              </div>
              <span className="hidden sm:inline-block">管理员</span>
              <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-hover:rotate-180" />
            </button>

            {/* 用户下拉菜单 - 添加桥接区域防止鼠标移出 */}
            <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
              <div className="w-48 rounded-lg border bg-popover/95 backdrop-blur-sm p-1 shadow-xl animate-in fade-in-0 zoom-in-95">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md hover:bg-accent/80 hover:text-accent-foreground transition-all duration-150"
                >
                  <User className="h-4 w-4" />
                  <span>个人信息</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md hover:bg-accent/80 hover:text-accent-foreground transition-all duration-150"
                >
                  <Settings className="h-4 w-4" />
                  <span>系统设置</span>
                </Link>
                <div className="my-1 h-px bg-border/50" />
                <button className="flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-150">
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
