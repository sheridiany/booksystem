# 高斯图书借阅系统 - 产品需求文档 (PRD)

**版本**: v1.0
**创建日期**: 2025-11-02
**产品类型**: 纸质图书借阅管理系统
**架构模式**: Monorepo (pnpm workspace)

---

## 一、产品概述

### 1.1 产品定位

高斯图书借阅系统是一款面向图书馆/阅览室的纸质图书管理平台，提供图书管理、借阅管理、在线预览等核心功能。

**核心价值**:
- 📚 纸质图书借阅全流程数字化
- 📖 电子书文件在线预览 (PDF/EPUB)
- 🎯 双端设计：管理端 + 用户端
- ⚡ 实用主义：解决实际问题，拒绝过度设计

### 1.2 设计原则 (铁律)

```yaml
实用主义原则:
  - ✅ 解决实际问题，而不是假想的威胁
  - ✅ 寻找最简方案，拒绝过度设计
  - ✅ 向后兼容是铁律
  - ❌ 拒绝微内核等"理论完美"但实际复杂的方案
  - ✅ 代码为现实服务，不是为论文服务
```

---

## 二、用户角色与权限

### 2.1 用户角色定义

| 角色 | 标识 | 权限范围 | 访问端 |
|------|------|----------|--------|
| **图书管理员** | `ADMIN` | 图书CRUD、借阅管理、读者管理、统计报表 | 管理端 (apps/admin) |
| **读者** | `READER` | 图书检索、在线借阅、借阅记录、文件预览 | 用户端 (apps/reader) |

### 2.2 权限矩阵

| 功能模块 | 管理员 | 读者 |
|----------|--------|------|
| 图书信息管理 | ✅ 增删改查 | ❌ 仅查看 |
| 图书分类管理 | ✅ 管理 | ❌ 仅查看 |
| 借阅操作 | ✅ 借出/归还/续借 | ✅ 发起借阅/归还/续借 |
| 读者管理 | ✅ 管理 | ❌ 仅查看自己 |
| 借阅记录 | ✅ 查看所有 | ✅ 仅查看自己 |
| 文件预览 | ✅ | ✅ |
| 统计报表 | ✅ | ❌ |

---

## 三、核心功能需求

### 3.1 管理端 (apps/admin)

#### 3.1.1 图书管理

**功能列表**:
- 📖 图书信息CRUD (书名、作者、ISBN、分类、库存、封面、简介等)
- 📁 图书文件上传 (PDF/EPUB，存储至 `/uploads` 目录)
- 🔍 图书检索 (按书名/作者/ISBN/分类)
- 🏷️ 分类管理 (图书分类体系维护)

**数据字段** (核心):
```typescript
Book {
  id: string;
  isbn: string;           // ISBN号
  title: string;          // 书名
  author: string;         // 作者
  publisher: string;      // 出版社
  categoryId: string;     // 分类ID
  totalCopies: number;    // 总库存
  availableCopies: number; // 可借数量
  coverUrl?: string;      // 封面URL
  fileUrl?: string;       // 电子文件URL (PDF/EPUB)
  fileType?: 'pdf' | 'epub'; // 文件类型
  description?: string;   // 简介
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.1.2 借阅管理

**功能列表**:
- ✅ 办理借阅 (扫码/手动输入)
- 🔄 办理归还
- ⏱️ 办理续借
- 📊 借阅状态查看 (借出中/已归还/逾期)
- ⚠️ 逾期提醒

**业务规则**:
- 单本图书借阅期限: 30天 (可配置)
- 最多可续借次数: 2次 (可配置)
- 单个读者最多借阅数量: 5本 (可配置)
- 逾期处理: 标记逾期状态 (暂不涉及罚款)

**数据字段** (核心):
```typescript
BorrowRecord {
  id: string;
  bookId: string;         // 图书ID
  readerId: string;       // 读者ID
  borrowDate: Date;       // 借阅日期
  dueDate: Date;          // 应还日期
  returnDate?: Date;      // 实际归还日期
  renewCount: number;     // 续借次数
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'; // 状态
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.1.3 读者管理

**功能列表**:
- 👤 读者信息CRUD (姓名、学号/工号、联系方式、状态)
- 🔍 读者检索
- 📊 读者借阅历史查看

**数据字段** (核心):
```typescript
Reader {
  id: string;
  userId: string;         // 关联用户账号
  name: string;           // 姓名
  studentId?: string;     // 学号/工号
  phone?: string;         // 联系方式
  email?: string;
  status: 'ACTIVE' | 'INACTIVE'; // 状态
  maxBorrowLimit: number; // 最大借阅数量
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.1.4 统计报表

**功能列表**:
- 📈 借阅统计 (按时间段/按图书/按读者)
- 📊 图书库存统计
- 🔥 热门图书排行
- ⚠️ 逾期统计

---

### 3.2 用户端 (apps/reader)

#### 3.2.1 图书检索与浏览

**功能列表**:
- 🔍 图书搜索 (书名/作者/ISBN)
- 🏷️ 分类浏览
- 📖 图书详情查看 (含库存状态)
- ⭐ 推荐图书 (可选)

#### 3.2.2 借阅操作

**功能列表**:
- ✅ 发起借阅申请 (需管理员审批或自动借出)
- 🔄 发起归还
- ⏱️ 发起续借
- 📋 我的借阅记录
- ⚠️ 逾期提醒

**简化方案**:
- 线上借阅采用"预约模式": 读者发起 → 管理员确认 → 线下取书
- 或直接由管理员扫码办理 (用户端仅查看记录)

#### 3.2.3 在线预览 ⭐ 核心功能

**功能列表**:
- 📄 PDF在线预览 (使用 react-pdf)
- 📚 EPUB在线阅读 (使用 epubjs)
- 🔖 阅读进度保存 (可选)
- 📱 响应式阅读器

**技术实现**:
```typescript
// PDF 渲染
import { Document, Page } from 'react-pdf';

// EPUB 渲染
import { ReactReader } from 'react-reader';
```

**权限控制**:
- 仅已借阅的图书可预览 (或所有图书可预览，根据业务决策)

---

## 四、技术架构

### 4.1 技术栈

```yaml
架构模式: Monorepo (pnpm workspace)
包管理器: pnpm

项目结构:
  apps/
    admin/    # 管理端 (Next.js 14+)
    reader/   # 用户端 (Next.js 14+)
    api/      # 后端API (NestJS)

  packages/
    ui/       # 共享UI组件 (shadcn/ui + Tailwind CSS)
    types/    # 共享类型定义
    utils/    # 共享工具函数

后端技术栈:
  框架: NestJS
  数据库: openGauss (使用 pg 驱动)
  ORM: Prisma (推荐 Prisma)
  认证: JWT Session (@nestjs/jwt + @nestjs/passport)
  文件存储: 本地 /uploads 目录
  架构: DDD 领域驱动设计

前端技术栈:
  框架: Next.js 14+ (App Router)
  UI库: shadcn/ui + Tailwind CSS
  状态管理: Zustand / React Context (视复杂度)
  表单: React Hook Form + Zod
  请求: Axios / TanStack Query
  PDF预览: react-pdf
  EPUB预览: epubjs

开发工具:
  TypeScript: 严格模式
  ESLint + Prettier
  Husky + lint-staged
```

### 4.2 Monorepo 目录结构

```
gz-books/
├── apps/
│   ├── admin/              # 管理端应用
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # 页面组件
│   │   ├── lib/            # 工具函数
│   │   └── public/         # 静态资源
│   │
│   ├── reader/             # 用户端应用
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   │
│   └── api/                # NestJS 后端
│       ├── src/
│       │   ├── modules/    # DDD模块
│       │   │   ├── book/
│       │   │   ├── borrow/
│       │   │   ├── reader/
│       │   │   ├── auth/
│       │   │   └── file/
│       │   ├── shared/     # 共享模块
│       │   └── main.ts
│       └── uploads/        # 文件存储目录
│
├── packages/
│   ├── ui/                 # 共享UI组件
│   │   ├── components/
│   │   └── styles/
│   ├── types/              # 共享类型
│   │   └── index.ts
│   └── utils/              # 共享工具
│       └── index.ts
│
├── docs/                   # 文档目录
│   ├── PRD.md              # 本文档
│   └── DDD-ARCHITECTURE.md # DDD架构设计
│
├── pnpm-workspace.yaml
├── package.json
├── turbo.json              # Turborepo配置 (可选)
└── README.md
```

### 4.3 数据库设计概要

**核心表**:
- `users` - 用户账号表 (管理员 + 读者)
- `readers` - 读者信息表
- `books` - 图书信息表
- `categories` - 图书分类表
- `borrow_records` - 借阅记录表
- `files` - 文件元数据表

**关系**:
```
users 1:1 readers
books N:1 categories
borrow_records N:1 books
borrow_records N:1 readers
```

---

## 五、非功能需求

### 5.1 性能要求

- 图书列表加载: < 1s
- 文件上传 (50MB): < 30s
- PDF预览首屏: < 3s
- 并发用户: 100+ (初期)

### 5.2 安全要求

- ✅ JWT认证 + 角色守卫
- ✅ 文件类型校验 (仅允许 PDF/EPUB/图片)
- ✅ 文件大小限制 (单文件 < 100MB)
- ✅ XSS/CSRF 防护
- ✅ HTTPS (生产环境)

### 5.3 兼容性要求

- 浏览器: Chrome/Edge/Safari (最近2个版本)
- 移动端: 响应式设计 (暂不要求原生APP)

---

## 六、MVP 功能范围

### 第一阶段 (MVP)

**管理端**:
- ✅ 图书CRUD
- ✅ 借阅办理 (借出/归还)
- ✅ 读者CRUD
- ✅ 文件上传

**用户端**:
- ✅ 图书检索
- ✅ 图书详情
- ✅ PDF/EPUB 在线预览
- ✅ 借阅记录查看

**认证**:
- ✅ 登录/登出
- ✅ 角色权限控制

### 第二阶段 (增强)

- ✅ 续借功能
- ✅ 逾期提醒
- ✅ 统计报表
- ✅ 分类管理
- ✅ 阅读进度保存

### 第三阶段 (优化)

- ✅ 智能推荐
- ✅ 全文搜索
- ✅ 消息通知
- ✅ 移动端优化

---

## 七、UI/UX 设计方向

### 7.1 管理端设计风格

**关键词**: 专业、高效、数据密集

**参考设计**:
- 布局: 侧边栏导航 + 主内容区
- 配色: 深色主题 (可选) / 专业蓝色系
- 组件: 数据表格、统计图表、表单

**页面结构**:
```
┌─────────────────────────────────────┐
│  [Logo]  高斯图书管理系统  [用户]  │
├─────────┬───────────────────────────┤
│ 图书管理 │  图书列表                │
│ 借阅管理 │  [搜索] [新增图书]       │
│ 读者管理 │  ┌──────────────────┐   │
│ 统计报表 │  │ 表格数据         │   │
│         │  └──────────────────┘   │
└─────────┴───────────────────────────┘
```

### 7.2 用户端设计风格

**关键词**: 简洁、阅读友好、沉浸式

**参考设计**:
- 布局: 卡片式布局 + 大留白
- 配色: 浅色主题 / 温暖色系
- 组件: 图书卡片、阅读器、搜索框

**页面结构**:
```
┌─────────────────────────────────────┐
│ [Logo]  [搜索]       [我的] [登录]  │
├─────────────────────────────────────┤
│  推荐图书                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │封面│ │封面│ │封面│ │封面│      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  热门分类                           │
│  [文学] [历史] [科技] [艺术]        │
└─────────────────────────────────────┘
```

---

## 八、项目里程碑

| 阶段 | 交付物 | 预计周期 |
|------|--------|----------|
| **阶段0** | PRD + DDD架构设计 | 1天 |
| **阶段1** | Monorepo 脚手架 + 数据库设计 | 2天 |
| **阶段2** | 后端API (图书/借阅/认证模块) | 5天 |
| **阶段3** | 管理端UI (图书/借阅管理) | 5天 |
| **阶段4** | 用户端UI (检索/预览) | 5天 |
| **阶段5** | 文件上传/预览功能 | 3天 |
| **阶段6** | 集成测试 + 优化 | 3天 |

**总计**: 约 24 天 (MVP版本)

---

## 九、风险与约束

### 9.1 技术风险

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| openGauss 驱动兼容性 | 中 | 使用 pg 驱动测试，必要时切换 PostgreSQL |
| 大文件上传性能 | 中 | 分片上传 + 进度条 |
| EPUB渲染兼容性 | 低 | epubjs 成熟方案，提供降级方案 |

### 9.2 业务约束

- ✅ 向后兼容铁律: 所有API需版本化
- ✅ 数据迁移: 预留导入导出功能
- ✅ 配置化: 借阅规则可后台配置

---

## 十、术语表

| 术语 | 定义 |
|------|------|
| **纸质图书** | 实体图书，非电子书 |
| **电子文件** | 图书的电子版本 (PDF/EPUB)，用于在线预览 |
| **借阅** | 读者从图书馆借出纸质图书的行为 |
| **预约** | 读者线上发起借阅申请，线下取书 |
| **续借** | 延长借阅期限 |
| **逾期** | 超过应还日期未归还 |
| **库存** | 图书的可借数量 |

---

## 十一、附录

### A. 参考资料

- [NestJS 官方文档](https://docs.nestjs.com/)
- [Next.js 14 文档](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [react-pdf](https://github.com/wojtekmaj/react-pdf)
- [epubjs](https://github.com/futurepress/epub.js)

### B. 更新日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2025-11-02 | 初始版本 |

---

**文档结束**
