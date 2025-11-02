[根目录](../../CLAUDE.md) > [apps](../) > **admin**

---

# apps/admin - 管理端应用

**职责**: 图书管理员操作界面，提供图书/借阅/读者全流程管理
**框架**: Next.js 15.1.6 (App Router)
**UI 库**: shadcn/ui + Tailwind CSS 3.4.17
**端口**: 3001
**目标用户**: 图书管理员 (ADMIN 角色)

---

## 变更记录 (Changelog)

### 2025-11-02 12:30:16 - 初始化模块文档
- 创建 CLAUDE.md 文档
- 完成 Next.js 15 脚手架搭建
- 配置 Tailwind CSS、shadcn/ui 依赖
- 集成共享包 (@repo/ui, @repo/types, @repo/utils)

---

## 一、模块职责

### 核心功能
1. **图书管理**
   - 图书 CRUD 操作 (创建、编辑、删除)
   - 图书文件上传 (PDF/EPUB、封面图)
   - 图书检索与分类管理
   - 库存管理

2. **借阅管理**
   - 办理借阅 (扫码/手动输入)
   - 办理归还
   - 办理续借
   - 借阅记录查询
   - 逾期提醒

3. **读者管理**
   - 读者信息 CRUD
   - 读者检索
   - 读者借阅历史查看
   - 借阅权限设置

4. **统计报表**
   - 借阅统计 (按时间段、图书、读者)
   - 图书库存统计
   - 热门图书排行
   - 逾期统计

5. **系统管理**
   - 管理员登录/登出
   - 图书分类管理
   - 系统配置 (借阅规则等)

---

## 二、入口与启动

### 入口文件
- **根布局**: `app/layout.tsx`
  - 设置全局 metadata (标题、描述)
  - 引入全局样式 `globals.css`
  - 配置中文语言 (`lang="zh-CN"`)

- **首页**: `app/page.tsx`
  - 当前: 占位页面 (显示"管理端 - 正在开发中")
  - 未来: 仪表盘 (统计数据、快速操作入口)

### 启动命令
```bash
# 开发模式 (端口 3001)
pnpm dev

# 构建生产版本
pnpm build

# 生产模式启动
pnpm start

# ESLint 检查
pnpm lint

# 清理构建产物
pnpm clean
```

### 环境变量
需要配置 `.env.local` (开发环境) 或 `.env.production`:
```bash
# API 地址
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# 文件上传地址
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
```

---

## 三、对外接口

### 页面路由 (计划中)

#### 认证相关
```
/login              # 登录页
/logout             # 登出 (重定向)
```

#### 仪表盘
```
/                   # 首页仪表盘
  - 今日借阅统计
  - 图书库存概览
  - 逾期提醒
  - 快速操作入口
```

#### 图书管理
```
/books              # 图书列表
/books/new          # 创建图书
/books/:id          # 图书详情
/books/:id/edit     # 编辑图书

/categories         # 分类管理
```

#### 借阅管理
```
/borrows            # 借阅记录列表
/borrows/new        # 办理借阅
/borrows/:id        # 借阅详情
```

#### 读者管理
```
/readers            # 读者列表
/readers/new        # 创建读者
/readers/:id        # 读者详情
/readers/:id/edit   # 编辑读者
```

#### 统计报表
```
/stats              # 统计报表首页
/stats/borrows      # 借阅统计
/stats/books        # 图书统计
/stats/popular      # 热门图书
```

---

## 四、关键依赖与配置

### 核心依赖
```json
{
  "next": "^15.1.6",                      // Next.js 框架
  "react": "^19.0.0",                     // React 19
  "react-dom": "^19.0.0",
  "axios": "^1.7.9",                      // HTTP 请求
  "@tanstack/react-query": "^5.62.12",    // 数据请求与缓存
  "react-hook-form": "^7.54.2",           // 表单管理
  "zod": "^3.24.1",                       // Schema 校验
  "@hookform/resolvers": "^3.9.1",        // RHF + Zod 集成
  "zustand": "^5.0.3",                    // 状态管理
  "clsx": "^2.1.1",                       // 类名合并
  "tailwind-merge": "^2.6.0",             // Tailwind 类名合并
  "@repo/ui": "workspace:*",              // 共享 UI 组件
  "@repo/types": "workspace:*",           // 共享类型
  "@repo/utils": "workspace:*"            // 共享工具
}
```

### 开发依赖
```json
{
  "@types/node": "^22.10.5",
  "@types/react": "^19.0.6",
  "@types/react-dom": "^19.0.2",
  "typescript": "^5.7.2",
  "tailwindcss": "^3.4.17",
  "postcss": "^8.4.49",
  "autoprefixer": "^10.4.20",
  "eslint": "^9.17.0",
  "eslint-config-next": "^15.1.6"
}
```

### Next.js 配置 (`next.config.ts`)
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 未来配置项:
  // - 图片域名白名单
  // - 环境变量
  // - 输出模式 (standalone for Docker)
};

export default nextConfig;
```

### Tailwind CSS 配置 (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 自定义主题
    },
  },
  plugins: [],
};
export default config;
```

---

## 五、关键依赖与配置

### 技术选型说明

#### 1. 状态管理 (Zustand)
```typescript
// 示例: 用户状态管理
// lib/store/user-store.ts

import { create } from 'zustand';
import { User } from '@repo/types';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// 使用
import { useUserStore } from '@/lib/store/user-store';

function UserInfo() {
  const { user, logout } = useUserStore();
  return <div>{user?.username} <button onClick={logout}>退出</button></div>;
}
```

#### 2. 数据请求 (TanStack Query + Axios)
```typescript
// lib/api/books.ts

import axios from 'axios';
import { Book } from '@repo/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookApi = {
  getBooks: (params?: { page?: number; keyword?: string }) =>
    api.get<{ items: Book[]; total: number }>('/books', { params }),

  getBook: (id: string) =>
    api.get<Book>(`/books/${id}`),

  createBook: (data: CreateBookDto) =>
    api.post<Book>('/books', data),
};

// 使用 TanStack Query
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookApi } from '@/lib/api/books';

function BookList() {
  const { data, isLoading } = useQuery({
    queryKey: ['books', { page: 1 }],
    queryFn: () => bookApi.getBooks({ page: 1 }),
  });

  if (isLoading) return <div>加载中...</div>;
  return <div>{data?.data.items.map(book => ...)}</div>;
}
```

#### 3. 表单管理 (React Hook Form + Zod)
```typescript
// components/book-form.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const bookSchema = z.object({
  title: z.string().min(1, '书名不能为空'),
  author: z.string().min(1, '作者不能为空'),
  isbn: z.string().regex(/^\d{10}(\d{3})?$/, 'ISBN 格式错误'),
  totalCopies: z.number().min(1, '库存至少为1'),
});

type BookFormData = z.infer<typeof bookSchema>;

function BookForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  });

  const onSubmit = (data: BookFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  );
}
```

---

## 六、数据模型

### 使用共享类型 (@repo/types)
```typescript
import {
  User,
  UserRole,
  Book,
  Category,
  BorrowRecord,
  BorrowStatus,
  Reader,
  ReaderStatus,
  FileMetadata,
  FileType,
  ApiResponse,
  PaginatedResponse,
} from '@repo/types';

// 示例: 图书列表响应类型
type BookListResponse = ApiResponse<PaginatedResponse<Book>>;

// 示例: 借阅记录扩展 (包含关联数据)
interface BorrowRecordWithDetails extends BorrowRecord {
  book: Book;
  reader: Reader;
}
```

### 表单 DTO 类型
```typescript
// lib/types/dto.ts

export interface CreateBookDto {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  totalCopies: number;
  description?: string;
  publishDate?: string;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {
  id: string;
}

export interface BorrowBookDto {
  bookId: string;
  readerId: string;
}
```

---

## 七、测试与质量

### 当前状态
- ⚠️ **测试框架**: 暂未配置 (建议使用 Jest + React Testing Library)
- ⚠️ **E2E 测试**: 暂未配置 (建议使用 Playwright)
- ✅ **ESLint**: 已配置 (eslint-config-next)
- ✅ **TypeScript**: 严格模式

### 建议配置

#### Jest 配置 (jest.config.js)
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### 测试示例
```typescript
// components/book-card.test.tsx

import { render, screen } from '@testing-library/react';
import { BookCard } from './book-card';

describe('BookCard', () => {
  it('renders book title', () => {
    const book = { id: '1', title: 'Test Book', author: 'Author' };
    render(<BookCard book={book} />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });
});
```

---

## 八、常见问题 (FAQ)

### Q1: 如何调用后端 API？
```typescript
// 1. 配置 Axios 实例
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 添加请求拦截器 (自动添加 JWT)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. 使用 TanStack Query
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: () => apiClient.get('/books').then(res => res.data),
  });
}
```

### Q2: 如何使用共享 UI 组件？
```typescript
import { Button } from '@repo/ui';

function MyComponent() {
  return (
    <Button variant="default" size="md" onClick={() => alert('点击')}>
      点击我
    </Button>
  );
}
```

### Q3: 如何实现路由守卫 (需要登录)?
```typescript
// middleware.ts (根目录)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // 未登录，重定向到登录页
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
```

### Q4: 如何上传文件？
```typescript
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  });
}

function FileUploadForm() {
  const uploadMutation = useUploadFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return <input type="file" onChange={handleFileChange} />;
}
```

---

## 九、相关文件清单

### 核心文件
- `app/layout.tsx` - 根布局
- `app/page.tsx` - 首页
- `app/globals.css` - 全局样式

### 配置文件
- `next.config.ts` - Next.js 配置
- `tailwind.config.ts` - Tailwind CSS 配置
- `postcss.config.mjs` - PostCSS 配置
- `tsconfig.json` - TypeScript 配置
- `package.json` - 依赖与脚本

### 未来文件结构 (计划)
```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx           # 仪表盘共享布局
│   ├── page.tsx             # 仪表盘首页
│   ├── books/
│   │   ├── page.tsx         # 图书列表
│   │   ├── new/
│   │   │   └── page.tsx     # 创建图书
│   │   └── [id]/
│   │       ├── page.tsx     # 图书详情
│   │       └── edit/
│   │           └── page.tsx # 编辑图书
│   ├── borrows/
│   ├── readers/
│   └── stats/
├── layout.tsx
└── page.tsx

components/
├── book-form.tsx
├── book-table.tsx
├── borrow-form.tsx
├── reader-form.tsx
└── ...

lib/
├── api/
│   ├── client.ts            # Axios 实例
│   ├── books.ts             # 图书 API
│   ├── borrows.ts           # 借阅 API
│   └── ...
├── hooks/
│   ├── use-books.ts         # 图书 hooks
│   └── ...
├── store/
│   ├── user-store.ts        # 用户状态
│   └── ...
└── utils/
    └── helpers.ts
```

---

## 十、下一步开发建议

### 优先级 1 (基础功能)
1. ✅ **登录页面**
   - 登录表单 (React Hook Form + Zod)
   - JWT 存储 (localStorage / cookie)
   - 登录状态管理 (Zustand)

2. ✅ **仪表盘首页**
   - 统计卡片 (借阅数、图书数、逾期数)
   - 快速操作入口
   - 最近借阅记录

3. ✅ **图书管理页面**
   - 图书列表 (表格、搜索、分页)
   - 创建图书表单
   - 编辑图书表单
   - 文件上传 (封面、内容)

### 优先级 2 (核心业务)
4. ✅ **借阅管理页面**
   - 借阅记录列表
   - 办理借阅表单
   - 办理归还/续借

5. ✅ **读者管理页面**
   - 读者列表
   - 读者 CRUD 表单

### 优先级 3 (增强功能)
6. ⚠️ **分类管理**
   - 分类树形展示
   - 分类 CRUD

7. ⚠️ **统计报表**
   - 图表展示 (使用 recharts / chart.js)
   - 数据导出

8. ⚠️ **系统配置**
   - 借阅规则配置
   - 系统参数管理

---

**文档维护**: 本文档随模块开发持续更新
