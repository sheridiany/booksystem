[根目录](../../CLAUDE.md) > [apps](../) > **reader**

---

# apps/reader - 用户端应用

**职责**: 读者操作界面，提供图书检索、在线预览、借阅记录查看
**框架**: Next.js 15.1.6 (App Router)
**UI 库**: shadcn/ui + Tailwind CSS 3.4.17
**端口**: 3002
**目标用户**: 读者 (READER 角色)

---

## 变更记录 (Changelog)

### 2025-11-02 12:30:16 - 初始化模块文档
- 创建 CLAUDE.md 文档
- 完成 Next.js 15 脚手架搭建
- 配置 Tailwind CSS、shadcn/ui 依赖
- 集成文件预览库 (react-pdf, epubjs, react-reader)
- 集成共享包 (@repo/ui, @repo/types, @repo/utils)

---

## 一、模块职责

### 核心功能
1. **图书检索与浏览**
   - 图书搜索 (书名、作者、ISBN)
   - 分类浏览
   - 图书详情查看 (含库存状态)
   - 推荐图书 (可选)

2. **在线预览 ⭐ 核心功能**
   - PDF 在线阅读 (react-pdf)
   - EPUB 在线阅读 (epubjs + react-reader)
   - 阅读进度保存 (可选)
   - 响应式阅读器 (支持移动端)

3. **借阅操作**
   - 发起借阅申请 (预约模式)
   - 发起归还
   - 发起续借
   - 我的借阅记录
   - 逾期提醒

4. **个人中心**
   - 个人信息查看
   - 借阅历史
   - 阅读统计 (可选)

---

## 二、入口与启动

### 入口文件
- **根布局**: `app/layout.tsx`
  - 设置全局 metadata (标题: "高斯图书馆")
  - 引入全局样式 `globals.css`
  - 配置中文语言 (`lang="zh-CN"`)

- **首页**: `app/page.tsx`
  - 当前: 占位页面 (显示"读者端 - 正在开发中")
  - 未来: 图书推荐 + 快速检索

### 启动命令
```bash
# 开发模式 (端口 3002)
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

# 文件预览地址
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads

# PDF.js Worker 路径 (可选，使用 CDN)
NEXT_PUBLIC_PDFJS_WORKER_URL=//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js
```

---

## 三、对外接口

### 页面路由 (计划中)

#### 认证相关
```
/login              # 登录页
/logout             # 登出 (重定向)
```

#### 首页与检索
```
/                   # 首页
  - 推荐图书卡片
  - 分类浏览入口
  - 搜索框

/books              # 图书列表
/books/:id          # 图书详情
/search             # 搜索结果页
```

#### 图书预览
```
/preview/pdf/:id    # PDF 在线预览
/preview/epub/:id   # EPUB 在线阅读
```

#### 借阅管理
```
/my-borrows         # 我的借阅记录
/my-borrows/:id     # 借阅详情
```

#### 个人中心
```
/profile            # 个人信息
/profile/edit       # 编辑个人信息
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
  "@hookform/resolvers": "^3.9.1",
  "zustand": "^5.0.3",                    // 状态管理
  "react-pdf": "^9.2.1",                  // PDF 预览 ⭐
  "epubjs": "^0.3.93",                    // EPUB 解析 ⭐
  "react-reader": "^2.0.9",               // EPUB 阅读器 ⭐
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "@repo/ui": "workspace:*",
  "@repo/types": "workspace:*",
  "@repo/utils": "workspace:*"
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

### 文件预览库配置

#### react-pdf 配置
```typescript
// 需要在使用前配置 worker
// components/pdf-viewer.tsx

import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc =
  process.env.NEXT_PUBLIC_PDFJS_WORKER_URL ||
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
```

#### epubjs + react-reader 配置
```typescript
// components/epub-reader.tsx

import { ReactReader } from 'react-reader';

// 基础使用，无需额外配置
```

---

## 五、关键依赖与配置

### PDF 阅读器实现

```typescript
// components/pdf-viewer.tsx

'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  bookId?: string;  // 用于保存阅读进度
}

export function PDFViewer({ fileUrl, bookId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber(p => Math.min(numPages, p + 1));
  const zoomIn = () => setScale(s => Math.min(2.0, s + 0.1));
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.1));

  return (
    <div className="pdf-viewer">
      <div className="controls">
        <button onClick={zoomOut}>缩小</button>
        <button onClick={zoomIn}>放大</button>
        <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
          上一页
        </button>
        <span>{pageNumber} / {numPages}</span>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
          下一页
        </button>
      </div>

      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>加载中...</div>}
        error={<div>加载失败</div>}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          loading={<div>渲染中...</div>}
        />
      </Document>
    </div>
  );
}
```

### EPUB 阅读器实现

```typescript
// components/epub-reader.tsx

'use client';

import { useState } from 'react';
import { ReactReader } from 'react-reader';

interface EPUBReaderProps {
  fileUrl: string;
  bookId?: string;  // 用于保存阅读进度
}

export function EPUBReader({ fileUrl, bookId }: EPUBReaderProps) {
  const [location, setLocation] = useState<string | number>(0);

  return (
    <div style={{ height: '100vh' }}>
      <ReactReader
        url={fileUrl}
        location={location}
        locationChanged={(epubcfi: string) => {
          setLocation(epubcfi);
          // 可选: 保存阅读进度到后端
          // saveReadingProgress(bookId, epubcfi);
        }}
        swipeable
        getRendition={(rendition) => {
          // 可选: 自定义样式
          rendition.themes.default({
            body: { 'font-family': 'serif !important' }
          });
        }}
      />
    </div>
  );
}
```

### 阅读进度保存 (可选)

```typescript
// lib/hooks/use-reading-progress.ts

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface SaveProgressDto {
  bookId: string;
  progress: string;  // PDF: 页码, EPUB: epubcfi
  fileType: 'pdf' | 'epub';
}

export function useSaveReadingProgress() {
  return useMutation({
    mutationFn: (data: SaveProgressDto) =>
      apiClient.post('/reading-progress', data),
  });
}

// 使用
function PDFViewerWithProgress({ fileUrl, bookId }: PDFViewerProps) {
  const saveMutation = useSaveReadingProgress();

  const onPageChange = (page: number) => {
    setPageNumber(page);
    saveMutation.mutate({
      bookId,
      progress: String(page),
      fileType: 'pdf',
    });
  };

  // ...
}
```

---

## 六、数据模型

### 使用共享类型 (@repo/types)
```typescript
import {
  Book,
  Category,
  BorrowRecord,
  BorrowStatus,
  Reader,
  FileMetadata,
  FileType,
  ApiResponse,
  PaginatedResponse,
} from '@repo/types';

// 示例: 图书详情扩展 (包含文件信息)
interface BookWithFiles extends Book {
  coverFile?: FileMetadata;
  contentFile?: FileMetadata;
  category?: Category;
}

// 示例: 借阅记录扩展
interface MyBorrowRecord extends BorrowRecord {
  book: Book;
}
```

### 阅读进度类型
```typescript
// lib/types/reading.ts

export interface ReadingProgress {
  id: string;
  bookId: string;
  userId: string;
  progress: string;     // PDF: 页码, EPUB: epubcfi
  fileType: 'pdf' | 'epub';
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingSession {
  bookId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;     // 阅读时长 (秒)
}
```

---

## 七、测试与质量

### 当前状态
- ⚠️ **测试框架**: 暂未配置 (建议使用 Jest + React Testing Library)
- ⚠️ **E2E 测试**: 暂未配置 (建议使用 Playwright)
- ✅ **ESLint**: 已配置 (eslint-config-next)
- ✅ **TypeScript**: 严格模式

### 测试建议

#### 组件测试示例
```typescript
// components/book-card.test.tsx

import { render, screen } from '@testing-library/react';
import { BookCard } from './book-card';

describe('BookCard', () => {
  it('renders book information', () => {
    const book = {
      id: '1',
      title: '测试图书',
      author: '作者',
      availableCopies: 3,
    };

    render(<BookCard book={book} />);

    expect(screen.getByText('测试图书')).toBeInTheDocument();
    expect(screen.getByText('作者')).toBeInTheDocument();
    expect(screen.getByText(/可借: 3/)).toBeInTheDocument();
  });
});
```

#### PDF 阅读器测试
```typescript
// components/pdf-viewer.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { PDFViewer } from './pdf-viewer';

// Mock react-pdf
jest.mock('react-pdf', () => ({
  Document: ({ onLoadSuccess, children }: any) => {
    React.useEffect(() => {
      onLoadSuccess({ numPages: 10 });
    }, []);
    return <div>{children}</div>;
  },
  Page: () => <div>Mock Page</div>,
  pdfjs: { GlobalWorkerOptions: {} },
}));

describe('PDFViewer', () => {
  it('renders PDF controls', async () => {
    render(<PDFViewer fileUrl="/test.pdf" />);

    await waitFor(() => {
      expect(screen.getByText(/1 \/ 10/)).toBeInTheDocument();
    });
  });
});
```

---

## 八、常见问题 (FAQ)

### Q1: PDF.js Worker 加载失败怎么办？
```typescript
// 方案1: 使用 CDN (推荐)
pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// 方案2: 本地安装 worker
// 1. 安装依赖
pnpm add pdfjs-dist

// 2. 复制 worker 到 public 目录
// node_modules/pdfjs-dist/build/pdf.worker.min.js -> public/pdf.worker.min.js

// 3. 配置路径
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

### Q2: 如何实现全屏阅读?
```typescript
function PDFViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef}>
      <button onClick={toggleFullscreen}>全屏</button>
      {/* PDF 内容 */}
    </div>
  );
}
```

### Q3: 如何优化大文件加载性能？
```typescript
// 方案1: 懒加载 (react-pdf 自带)
<Document
  file={fileUrl}
  loading={<Skeleton />}
  options={{
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }}
>
  <Page pageNumber={pageNumber} />
</Document>

// 方案2: 使用缩略图预览
<Page
  pageNumber={pageNumber}
  renderTextLayer={false}      // 禁用文本层
  renderAnnotationLayer={false} // 禁用注释层
  scale={0.5}                   // 缩小比例
/>

// 方案3: 分页加载 (仅加载当前页和前后页)
const visiblePages = [pageNumber - 1, pageNumber, pageNumber + 1]
  .filter(p => p >= 1 && p <= numPages);

{visiblePages.map(p => (
  <Page key={p} pageNumber={p} />
))}
```

### Q4: EPUB 样式如何自定义？
```typescript
<ReactReader
  url={fileUrl}
  getRendition={(rendition) => {
    // 注册自定义主题
    rendition.themes.register('custom', {
      body: {
        'font-family': '"Noto Serif SC", serif !important',
        'font-size': '18px !important',
        'line-height': '1.8 !important',
      },
      p: {
        'text-indent': '2em !important',
      },
    });

    // 应用主题
    rendition.themes.select('custom');
  }}
/>
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
├── (main)/
│   ├── layout.tsx           # 主布局 (导航栏)
│   ├── page.tsx             # 首页 (推荐图书)
│   ├── books/
│   │   ├── page.tsx         # 图书列表
│   │   └── [id]/
│   │       └── page.tsx     # 图书详情
│   ├── preview/
│   │   ├── pdf/
│   │   │   └── [id]/
│   │   │       └── page.tsx # PDF 预览
│   │   └── epub/
│   │       └── [id]/
│   │           └── page.tsx # EPUB 预览
│   ├── my-borrows/
│   │   ├── page.tsx         # 借阅记录
│   │   └── [id]/
│   │       └── page.tsx     # 借阅详情
│   └── profile/
│       ├── page.tsx         # 个人信息
│       └── edit/
│           └── page.tsx     # 编辑个人信息
├── layout.tsx
└── page.tsx

components/
├── pdf-viewer.tsx           # PDF 阅读器
├── epub-reader.tsx          # EPUB 阅读器
├── book-card.tsx            # 图书卡片
├── book-list.tsx            # 图书列表
├── borrow-card.tsx          # 借阅记录卡片
└── ...

lib/
├── api/
│   ├── client.ts
│   ├── books.ts
│   ├── borrows.ts
│   └── reading-progress.ts
├── hooks/
│   ├── use-books.ts
│   ├── use-reading-progress.ts
│   └── ...
└── store/
    ├── user-store.ts
    └── reading-store.ts
```

---

## 十、下一步开发建议

### 优先级 1 (基础功能)
1. ✅ **登录页面**
   - 登录表单
   - JWT 存储
   - 用户状态管理

2. ✅ **首页**
   - 推荐图书卡片展示
   - 分类浏览入口
   - 搜索框

3. ✅ **图书列表与详情**
   - 图书列表 (卡片式布局)
   - 图书详情页 (含库存、简介、预览入口)
   - 搜索与筛选

### 优先级 2 (核心功能)
4. ✅ **PDF 预览页面**
   - PDF 阅读器组件
   - 分页控制
   - 缩放控制
   - 全屏模式

5. ✅ **EPUB 预览页面**
   - EPUB 阅读器组件
   - 翻页控制
   - 自定义样式

6. ✅ **借阅记录页面**
   - 我的借阅列表
   - 借阅详情
   - 续借操作

### 优先级 3 (增强功能)
7. ⚠️ **阅读进度保存**
   - 保存 PDF 页码
   - 保存 EPUB 位置
   - 恢复阅读进度

8. ⚠️ **个人中心**
   - 个人信息展示
   - 阅读统计
   - 信息编辑

9. ⚠️ **响应式优化**
   - 移动端适配
   - 触摸手势支持 (翻页、缩放)

---

**文档维护**: 本文档随模块开发持续更新
