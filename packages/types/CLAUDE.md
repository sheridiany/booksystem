[根目录](../../CLAUDE.md) > [packages](../) > **types**

---

# packages/types - 共享类型定义

**职责**: 提供跨应用的共享 TypeScript 类型定义
**包名**: `@repo/types`
**消费者**: apps/admin, apps/reader, apps/api (部分)

---

## 变更记录 (Changelog)

### 2025-11-02 12:30:16 - 初始化模块文档
- 创建 CLAUDE.md 文档
- 完成核心类型定义 (User, Book, BorrowRecord 等)
- 定义枚举类型 (UserRole, BorrowStatus 等)
- 定义 API 响应类型 (ApiResponse, PaginatedResponse)

---

## 一、模块职责

### 核心功能
1. **领域模型类型**
   - User (用户)
   - Reader (读者)
   - Book (图书)
   - Category (分类)
   - BorrowRecord (借阅记录)
   - FileMetadata (文件元数据)

2. **枚举类型**
   - UserRole (用户角色)
   - ReaderStatus (读者状态)
   - BorrowStatus (借阅状态)
   - FileType (文件类型)

3. **API 通用类型**
   - ApiResponse (API 响应)
   - PaginatedResponse (分页响应)
   - ErrorResponse (错误响应)

4. **DTO 类型** (可选)
   - CreateBookDto
   - UpdateBookDto
   - BorrowBookDto
   - 等

---

## 二、入口与启动

### 入口文件
- **主入口**: `index.ts`
  - 导出所有类型和枚举
  - 供 apps/* 通过 `@repo/types` 导入

### 导出方式
```typescript
// index.ts
export * from './user';
export * from './book';
export * from './borrow';
export * from './api';

// 使用
import { User, UserRole, Book, ApiResponse } from '@repo/types';
```

### 开发模式
本包不需要构建，TypeScript 直接引用：
```bash
# 无需独立运行，在应用中直接使用
import { Book } from '@repo/types';
```

---

## 三、对外接口

### 类型导出清单

#### 用户相关
```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  READER = 'READER',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 读者相关
```typescript
export enum ReaderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Reader {
  id: string;
  userId: string;
  name: string;
  studentId?: string;
  phone?: string;
  email?: string;
  status: ReaderStatus;
  maxBorrowLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 图书相关
```typescript
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum FileType {
  PDF = 'pdf',
  EPUB = 'epub',
  IMAGE = 'image',
  OTHER = 'other',
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  totalCopies: number;
  availableCopies: number;
  coverFileId?: string;
  contentFileId?: string;
  description?: string;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 借阅相关
```typescript
export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  readerId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  renewCount: number;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 文件相关
```typescript
export interface FileMetadata {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
}
```

#### API 响应类型
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 四、关键依赖与配置

### 核心依赖
```json
{
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

### package.json 配置
```json
{
  "name": "@repo/types",
  "version": "1.0.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": "./index.ts"
  }
}
```

### tsconfig.json 配置
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "noEmit": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 五、数据模型

### 完整类型定义

```typescript
// index.ts

// ========== 用户相关 ==========
export enum UserRole {
  ADMIN = 'ADMIN',
  READER = 'READER',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========== 读者相关 ==========
export enum ReaderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Reader {
  id: string;
  userId: string;
  name: string;
  studentId?: string;
  phone?: string;
  email?: string;
  status: ReaderStatus;
  maxBorrowLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========== 图书相关 ==========
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum FileType {
  PDF = 'pdf',
  EPUB = 'epub',
  IMAGE = 'image',
  OTHER = 'other',
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  totalCopies: number;
  availableCopies: number;
  coverFileId?: string;
  contentFileId?: string;
  description?: string;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========== 借阅相关 ==========
export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  readerId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  renewCount: number;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ========== 文件相关 ==========
export interface FileMetadata {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
}

// ========== API 响应类型 ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 六、测试与质量

### 当前状态
- ✅ **TypeScript**: 严格类型检查
- ⚠️ **测试**: 类型定义无需测试

### 类型校验
```bash
# 在应用中运行类型检查
cd apps/admin
pnpm tsc --noEmit

cd apps/api
pnpm tsc --noEmit
```

---

## 七、常见问题 (FAQ)

### Q1: 如何添加新类型？
```typescript
// 1. 在 index.ts 中定义新类型
export interface Comment {
  id: string;
  bookId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// 2. 在应用中使用
import { Comment } from '@repo/types';

function MyComponent() {
  const comment: Comment = { ... };
}
```

### Q2: 如何扩展已有类型？
```typescript
// 方案1: 扩展接口
import { Book } from '@repo/types';

interface BookWithCategory extends Book {
  category: Category;
}

// 方案2: 使用 Partial / Pick / Omit
import { Book } from '@repo/types';

type CreateBookDto = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateBookDto = Partial<CreateBookDto> & { id: string };
```

### Q3: 前后端类型如何同步？
```typescript
// 方案1: 共享类型包 (当前方案)
// 前端和后端都导入 @repo/types

// 方案2: 后端生成类型定义 (可选)
// 使用 ts-json-schema-generator 或 typeorm-model-generator

// 方案3: OpenAPI / GraphQL Code Gen (可选)
// 从 API Schema 自动生成类型
```

### Q4: 如何处理 Date 类型序列化问题？
```typescript
// 问题: API 返回的 Date 是字符串，类型定义是 Date

// 方案1: 使用联合类型
export interface Book {
  // ...
  publishDate?: Date | string;  // 兼容字符串
  createdAt: Date | string;
}

// 方案2: 定义 DTO 类型
export interface BookDto {
  // ...
  publishDate?: string;  // API 响应用字符串
  createdAt: string;
}

export interface Book {
  // ...
  publishDate?: Date;    // 前端转换为 Date
  createdAt: Date;
}

// 方案3: 使用转换函数
export function apiBookToBook(dto: BookDto): Book {
  return {
    ...dto,
    publishDate: dto.publishDate ? new Date(dto.publishDate) : undefined,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
```

---

## 八、相关文件清单

### 核心文件
- `index.ts` - 主入口，所有类型定义

### 配置文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置

### 未来文件结构 (可选优化)
```
packages/types/
├── index.ts                # 导出所有类型
├── user.ts                 # 用户相关类型
├── book.ts                 # 图书相关类型
├── borrow.ts               # 借阅相关类型
├── file.ts                 # 文件相关类型
├── api.ts                  # API 响应类型
├── dto/                    # DTO 类型 (可选)
│   ├── book.dto.ts
│   ├── borrow.dto.ts
│   └── ...
├── package.json
└── tsconfig.json
```

---

## 九、下一步开发建议

### 优先级 1 (基础类型)
1. ✅ **完善现有类型**
   - 添加注释说明
   - 补充可选字段

2. ⚠️ **添加 DTO 类型**
   - CreateBookDto
   - UpdateBookDto
   - BorrowBookDto
   - 等

### 优先级 2 (扩展类型)
3. ⚠️ **统计类型**
   - BorrowStatistics
   - BookStatistics
   - PopularBook

4. ⚠️ **查询参数类型**
   - BookQueryParams
   - BorrowQueryParams
   - PaginationParams

### 优先级 3 (工具类型)
5. ⚠️ **通用类型工具**
   - ApiPaginatedResponse<T>
   - WithTimestamps<T>
   - Identifiable<T>

---

**文档维护**: 本文档随类型定义持续更新
