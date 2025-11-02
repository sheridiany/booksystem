import { ReactNode } from 'react';
import { Header } from './header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <Header />

      {/* 主内容区 */}
      <main className="mx-auto max-w-[1600px] px-4 py-5">
        {children}
      </main>
    </div>
  );
}
