'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // 避免水合不匹配
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-100 dark:bg-gray-800/50 transition-colors"
        aria-label="切换主题"
        disabled
      >
        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group relative inline-flex h-7 w-14 items-center rounded-full bg-gray-100 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 focus:outline-none"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {/* 滑动的圆形按钮 */}
      <span
        className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:shadow-lg ${
          isDark ? 'translate-x-[1.875rem] rotate-[360deg]' : 'translate-x-1 rotate-0'
        }`}
      >
        {/* 太阳图标（浅色模式显示） */}
        <Sun
          className={`absolute h-3.5 w-3.5 text-orange-500 transition-all duration-500 ${
            isDark
              ? 'rotate-180 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          }`}
          strokeWidth={2.5}
        />
        {/* 月亮图标（深色模式显示） */}
        <Moon
          className={`absolute h-3.5 w-3.5 text-indigo-500 transition-all duration-500 ${
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-180 scale-0 opacity-0'
          }`}
          strokeWidth={2.5}
        />
      </span>
    </button>
  );
}
