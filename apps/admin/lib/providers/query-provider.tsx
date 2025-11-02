'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * TanStack Query Provider
 *
 * 功能:
 * - 提供全局 QueryClient 实例
 * - 配置缓存策略
 * - 开发环境启用 React Query Devtools
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 数据保持新鲜时间 (5分钟)
            staleTime: 5 * 60 * 1000,
            // 缓存时间 (30分钟)
            gcTime: 30 * 60 * 1000,
            // 失败重试次数
            retry: 1,
            // 窗口重新获得焦点时重新获取数据
            refetchOnWindowFocus: false,
            // 网络重连时重新获取数据
            refetchOnReconnect: true,
          },
          mutations: {
            // mutation 失败重试次数
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 仅在开发环境显示 Devtools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
