import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BookOpen, Users, BookMarked, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            欢迎使用众慧图书管理系统
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="图书总数"
            value="1,234"
            description="+20 本本月新增"
            icon={BookOpen}
            trend="up"
          />
          <StatCard
            title="读者总数"
            value="456"
            description="+12 人本月新增"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="在借图书"
            value="89"
            description="7.2% 借出率"
            icon={BookMarked}
            trend="neutral"
          />
          <StatCard
            title="本月借阅"
            value="234"
            description="+15% 较上月"
            icon={TrendingUp}
            trend="up"
          />
        </div>

        {/* 快速操作 */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-3">快速操作</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <QuickAction
                title="添加图书"
                description="录入新图书信息"
                href="/books/new"
              />
              <QuickAction
                title="办理借阅"
                description="为读者办理借书"
                href="/borrows/new"
              />
              <QuickAction
                title="办理归还"
                description="处理图书归还"
                href="/borrows"
              />
            </div>
          </div>
        </div>

        {/* 最近借阅记录 */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-3">最近借阅记录</h2>
            <div className="space-y-3">
              <BorrowRecord
                bookTitle="深入理解计算机系统"
                readerName="张三"
                borrowDate="2025-11-01"
                status="已借出"
              />
              <BorrowRecord
                bookTitle="算法导论"
                readerName="李四"
                borrowDate="2025-10-28"
                status="已归还"
              />
              <BorrowRecord
                bookTitle="设计模式"
                readerName="王五"
                borrowDate="2025-10-25"
                status="已逾期"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// 统计卡片组件
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-muted-foreground bg-muted',
  };

  const iconBgColors = {
    up: 'bg-green-100 text-green-600',
    down: 'bg-red-100 text-red-600',
    neutral: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="group rounded-lg border bg-gradient-to-br from-card to-card/50 p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${iconBgColors[trend]} transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className={`mt-3 px-2 py-1 rounded-md text-xs font-medium inline-block ${trendColors[trend]}`}>
        {description}
      </div>
    </div>
  );
}

// 快速操作组件
function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group block rounded-lg border bg-gradient-to-br from-background to-background/50 p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-primary/50"
    >
      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1.5 group-hover:text-muted-foreground/80">{description}</p>
    </a>
  );
}

// 借阅记录组件
function BorrowRecord({
  bookTitle,
  readerName,
  borrowDate,
  status,
}: {
  bookTitle: string;
  readerName: string;
  borrowDate: string;
  status: string;
}) {
  const statusColors: Record<string, string> = {
    已借出: 'bg-blue-100 text-blue-700 border-blue-200',
    已归还: 'bg-green-100 text-green-700 border-green-200',
    已逾期: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="group flex items-center justify-between py-3 px-2 rounded-md hover:bg-accent/50 transition-all duration-200">
      <div className="flex-1">
        <p className="font-medium text-sm group-hover:text-primary transition-colors">{bookTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">
          读者: {readerName} · {borrowDate}
        </p>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColors[status]} shadow-sm`}
      >
        {status}
      </span>
    </div>
  );
}
