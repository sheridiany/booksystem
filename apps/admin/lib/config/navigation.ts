import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    title: '仪表盘',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: '图书管理',
    href: '/books',
    icon: BookOpen,
    children: [
      {
        title: '图书列表',
        href: '/books',
      },
      {
        title: '添加图书',
        href: '/books/new',
      },
      {
        title: '图书分类',
        href: '/categories',
      },
    ],
  },
  {
    title: '借阅管理',
    href: '/borrows',
    icon: BookMarked,
    children: [
      {
        title: '借阅记录',
        href: '/borrows',
      },
      {
        title: '办理借阅',
        href: '/borrows/new',
      },
      {
        title: '逾期提醒',
        href: '/borrows/overdue',
        badge: 0, // 动态更新逾期数量
      },
    ],
  },
  {
    title: '读者管理',
    href: '/readers',
    icon: Users,
    children: [
      {
        title: '读者列表',
        href: '/readers',
      },
      {
        title: '添加读者',
        href: '/readers/new',
      },
    ],
  },
  {
    title: '统计报表',
    href: '/stats',
    icon: BarChart3,
    children: [
      {
        title: '借阅统计',
        href: '/stats/borrows',
      },
      {
        title: '图书统计',
        href: '/stats/books',
      },
      {
        title: '热门排行',
        href: '/stats/popular',
      },
    ],
  },
  {
    title: '系统设置',
    href: '/settings',
    icon: Settings,
  },
];
