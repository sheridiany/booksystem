# 图书类型区分改造总结

**改造日期**: 2025-11-02
**改造目标**: 将电子图书和纸质图书分离，解决业务逻辑混乱问题
**改造状态**: ✅ 核心架构完成（约70%），待完成控制器、迁移脚本和前端集成

---

## 📊 改造概述

### 问题描述
原设计将电子图书和纸质图书的数据存储在同一张 `Book` 表中，导致以下问题：
- ❌ **库存字段对电子书无意义**（电子书理论上无限复制）
- ❌ **借阅逻辑混乱**（纸质书需归还，电子书可能不需要）
- ❌ **ISBN 强制必填**（部分电子资源可能无 ISBN）
- ❌ **无法支持同一本书既有纸质版又有电子版**

### 解决方案
采用 **Book + BookCopy** 组合模式：
- **Book**：图书元信息（书名、作者、出版社、分类、封面）
- **BookCopy**：图书载体（纸质书/电子书的具体实例）
- **关系**：一本书（Book）可以有多个载体（BookCopy）

---

## ✅ 已完成工作

### 1. **数据库层重构** ✅

**文件**: `apps/api/prisma/schema.prisma`

#### 核心变更：
```prisma
// Book: 图书元信息
model Book {
  isbn        String?   @unique  // 改为可选
  // 移除: totalCopies, availableCopies, contentFileId
  copies      BookCopy[]  // 新增关系
}

// BookCopy: 图书载体（新增）
model BookCopy {
  bookId          String
  type            String  // PHYSICAL | EBOOK

  // 纸质书字段
  totalCopies     Int?
  availableCopies Int?
  location        String?

  // 电子书字段
  ebookFormat     String?  // pdf | epub | mobi
  fileId          String?
  fileSize        Int?

  borrowRecords   BorrowRecord[]
}

// BorrowRecord: 借阅记录
model BorrowRecord {
  bookCopyId  String  // 改为关联载体而非图书
  dueDate     DateTime?  // 改为可选：电子书可能无归还日期
}
```

---

### 2. **领域模型重构** ✅

#### 2.1 **BookCopy 实体** (新增)

**文件**: `apps/api/src/modules/book/domain/entities/book-copy.entity.ts`

**关键特性**:
```typescript
export enum BookCopyType {
  PHYSICAL = 'PHYSICAL',  // 纸质图书
  EBOOK = 'EBOOK',        // 电子图书
}

export class BookCopy {
  // 智能验证：根据类型验证不同字段
  private validate(): void {
    if (this.type === BookCopyType.PHYSICAL) {
      if (!this.totalCopies || this.totalCopies < 1) {
        throw new Error('纸质图书总库存至少为 1');
      }
    } else if (this.type === BookCopyType.EBOOK) {
      if (!this.fileId) {
        throw new Error('电子图书必须上传文件');
      }
      if (!this.ebookFormat) {
        throw new Error('电子图书必须指定格式');
      }
    }
  }

  // 借出：纸质书减库存，电子书无操作
  borrow(): void {
    if (this.type === BookCopyType.PHYSICAL) {
      if (!this.availableCopies || this.availableCopies <= 0) {
        throw new Error('纸质图书库存不足');
      }
      this.availableCopies -= 1;
    }
    // 电子书无需操作（无限并发）
  }

  // 归还：纸质书加库存，电子书无操作
  returnBook(): void {
    if (this.type === BookCopyType.PHYSICAL) {
      this.availableCopies += 1;
    }
  }
}
```

#### 2.2 **Book 实体** (简化)

**文件**: `apps/api/src/modules/book/domain/entities/book.entity.ts`

**变更**:
- ❌ **移除**：`totalCopies`、`availableCopies`、`contentFileId`
- ❌ **移除**：`borrow()`、`returnBook()`、`updateTotalCopies()` 等库存管理方法
- ✅ **改进**：ISBN 改为可选（`string | null`）
- ✅ **保留**：图书元信息管理方法

---

### 3. **仓储层实现** ✅

#### 3.1 **BookCopy 仓储** (新增)

**接口**: `apps/api/src/modules/book/domain/repositories/book-copy.repository.interface.ts`
**实现**: `apps/api/src/modules/book/infrastructure/repositories/book-copy.repository.ts`

**核心方法**:
```typescript
interface IBookCopyRepository {
  // 查找可借阅载体（智能检查：纸质书需检查库存，电子书仅检查状态）
  findAvailableByBookIdAndType(bookId: string, type: BookCopyType): Promise<BookCopy[]>;

  // 统计指定图书的载体数量（按类型分组）
  countByBookId(bookId: string): Promise<{physical: number, ebook: number, total: number}>;

  // 获取所有纸质书的库存统计（聚合查询）
  getTotalPhysicalInventory(): Promise<{totalCopies, availableCopies, borrowedCopies}>;
}
```

#### 3.2 **Book 仓储** (调整)

**文件**: `apps/api/src/modules/book/infrastructure/repositories/book.repository.ts`

**变更**:
- ✅ `save()`: 移除 `totalCopies`、`availableCopies`、`contentFileId` 字段
- ✅ `hasActiveBorrows()`: 通过 `BookCopy` 关联查询
- ✅ `findPopular()`: 通过 `BookCopy` 统计借阅次数
- ✅ `toDomain()`: 移除库存字段映射

---

### 4. **应用层 DTO** ✅

#### 4.1 **BookCopy DTO** (新增)

**文件**: `apps/api/src/modules/book/application/dto/book-copy.dto.ts`

**核心 DTO**:
```typescript
export class CreateBookCopyDto {
  bookId: string;
  type: BookCopyType;  // PHYSICAL | EBOOK

  // 纸质书字段（条件必填）
  @ValidateIf(o => o.type === 'PHYSICAL')
  @IsNumber()
  @Min(1)
  totalCopies?: number;

  // 电子书字段（条件必填）
  @ValidateIf(o => o.type === 'EBOOK')
  @IsString()
  @IsNotEmpty()
  fileId?: string;

  @ValidateIf(o => o.type === 'EBOOK')
  @IsIn(['pdf', 'epub', 'mobi'])
  ebookFormat?: EbookFormat;
}

export class UpdateBookCopyDto {
  status?: BookCopyStatus;
  totalCopies?: number;  // 仅纸质书
  location?: string;
  fileId?: string;  // 仅电子书
}

export class BookCopyDto {
  id: string;
  bookId: string;
  type: string;
  status: string;
  totalCopies: number | null;
  availableCopies: number | null;
  ebookFormat: string | null;
  fileId: string | null;
  // ...
}
```

#### 4.2 **Book DTO** (调整)

**文件**: `apps/api/src/modules/book/application/dto/book.dto.ts`

**变更**:
```typescript
export class CreateBookDto {
  @IsOptional()
  isbn?: string | null;  // 改为可选
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  coverFileId?: string;
  description?: string;
  publishDate?: string;
  // 移除: totalCopies, contentFileId
}

export class BookDto {
  id: string;
  isbn: string | null;  // 改为可选
  title: string;
  // ...
  copies?: BookCopyDto[];  // 可选关联载体
  // 移除: totalCopies, availableCopies, borrowedCount
}
```

---

### 5. **业务用例** ✅ (部分)

#### 5.1 **CreateBookCopyUseCase** (新增)

**文件**: `apps/api/src/modules/book/application/use-cases/create-book-copy.use-case.ts`

**业务规则**:
1. 验证图书是否存在
2. 根据类型验证必填字段（实体内部验证）
3. 创建载体实体并持久化

---

## ⏳ 待完成工作

### 高优先级（核心功能）:

1. **调整借阅用例** ⏳
   - 文件: `apps/api/src/modules/borrow/application/use-cases/borrow-book.use-case.ts`
   - 变更: `BorrowBookDto.bookId` → `bookCopyId`
   - 逻辑: 调用 `bookCopy.borrow()` 而非 `book.borrow()`

2. **创建 BookCopy 控制器** ⏳
   - 文件: `apps/api/src/modules/book/presentation/controllers/book-copy.controller.ts`
   - 路由:
     ```
     POST   /api/v1/book-copies       # 创建载体
     GET    /api/v1/book-copies/:id   # 获取载体详情
     GET    /api/v1/books/:id/copies  # 获取指定图书的所有载体
     PUT    /api/v1/book-copies/:id   # 更新载体
     DELETE /api/v1/book-copies/:id   # 删除载体
     GET    /api/v1/book-copies/:id/stats  # 载体统计
     ```

3. **调整 Book 控制器** ⏳
   - 文件: `apps/api/src/modules/book/presentation/controllers/book.controller.ts`
   - 移除: 与库存相关的接口（如更新库存）
   - 调整: 创建图书时不再需要库存字段

4. **创建数据库迁移脚本** ⏳
   - 文件: `apps/api/prisma/migrations/xxx_add_book_copy.sql`
   - 步骤:
     ```sql
     -- 1. 创建 BookCopy 表
     CREATE TABLE "book_copies" (...);

     -- 2. 迁移现有数据（将 Book 拆分为 Book + BookCopy）
     INSERT INTO "book_copies" (id, book_id, type, total_copies, available_copies)
     SELECT gen_random_uuid(), id, 'PHYSICAL', total_copies, available_copies
     FROM "books"
     WHERE total_copies IS NOT NULL;

     -- 3. 更新 BorrowRecord 关联
     ALTER TABLE "borrow_records" ADD COLUMN "book_copy_id" VARCHAR;
     UPDATE "borrow_records" br
     SET book_copy_id = (
       SELECT bc.id FROM "book_copies" bc WHERE bc.book_id = br.book_id LIMIT 1
     );
     ALTER TABLE "borrow_records" DROP COLUMN "book_id";

     -- 4. 删除 Book 表中的冗余字段
     ALTER TABLE "books" DROP COLUMN total_copies;
     ALTER TABLE "books" DROP COLUMN available_copies;
     ALTER TABLE "books" DROP COLUMN content_file_id;
     ALTER TABLE "books" ALTER COLUMN isbn DROP NOT NULL;
     ```

---

### 中优先级（前端集成）:

5. **调整前端图书表单** ⏳
   - 文件: `apps/admin/components/books/book-form.tsx`
   - 改造: 两步流程
     ```
     Step 1: 创建图书元信息（Book）
       - ISBN（可选）
       - 标题、作者、出版社、分类
       - 封面图、描述、出版日期
       ↓ 提交后返回 bookId

     Step 2: 添加载体（BookCopy）
       - 选择类型：纸质书 / 电子书
       - 纸质书字段：库存数量、存放位置
       - 电子书字段：文件格式、上传文件
       ↓ 可多次添加载体（支持同一本书多个载体）
     ```

---

### 低优先级（文档和类型）:

6. **更新 API 文档** ⏳
   - 新增: `BookCopy` 相关接口说明
   - 调整: `Book` 接口说明（移除库存相关）
   - 调整: `Borrow` 接口说明（使用 `bookCopyId`）

7. **更新共享类型定义** ⏳
   - 文件: `packages/types/index.ts`
   - 新增: `BookCopyType`、`BookCopyStatus`、`EbookFormat` 枚举
   - 新增: `BookCopyDto`、`CreateBookCopyDto` 等类型

---

## 🎯 核心差异对比

| 维度 | 纸质图书 (`PHYSICAL`) | 电子图书 (`EBOOK`) |
|------|----------------------|-------------------|
| **库存管理** | ✅ 有限库存（`totalCopies`、`availableCopies`） | ❌ 无限制（理论上无限复制） |
| **借阅行为** | 📉 `borrow()` 减库存，`returnBook()` 加库存 | ⏸️ 无操作（可无限并发） |
| **ISBN要求** | ⚠️ 通常必填 | ✅ 可选（内部资源可能无ISBN） |
| **必填字段** | `totalCopies` >= 1, `location`可选 | `fileId`、`ebookFormat` 必填 |
| **文件验证** | ❌ 无 | ✅ 验证PDF/EPUB格式和文件大小 |
| **借阅限制** | 物理数量限制 | 无限制（按业务需求） |
| **归还日期** | ✅ 必填 | ⏸️ 可选（电子书可能无需归还） |

---

## 📋 业务流程对比

### 原方案（有问题）:
```
创建图书 → 设置库存 → 借阅时减库存
问题：电子书和纸质书混在一起，逻辑混乱
```

### 新方案（已实现）:
```
Step 1: 创建图书元信息（Book）
  ↓
Step 2a: 添加纸质版载体（BookCopy - PHYSICAL）
  - 设置库存数量、存放位置
  - 借阅时减库存

Step 2b: 添加电子版载体（BookCopy - EBOOK）
  - 上传PDF/EPUB文件
  - 借阅时无库存限制

关系: 一本书（Book）可以同时有多个载体（BookCopy）
```

---

## ⚡ 快速开发指南

### 完成剩余工作的建议顺序：

1. **创建数据库迁移脚本** ⏳ (最重要，阻塞其他工作)
   ```bash
   cd apps/api
   npx prisma migrate dev --name add_book_copy_table
   # 手动编辑迁移SQL，添加数据迁移逻辑
   ```

2. **创建 BookCopy 控制器** ⏳
   - 参考 `book.controller.ts` 的结构
   - 注入 `CreateBookCopyUseCase`
   - 实现 CRUD 接口

3. **调整借阅用例** ⏳
   - 修改 `BorrowBookDto`：`bookId` → `bookCopyId`
   - 修改 `BorrowBookUseCase`：查询 `BookCopy` 而非 `Book`
   - 调用 `bookCopy.borrow()` 和 `bookCopy.returnBook()`

4. **前端表单改造** ⏳ (可并行)
   - 创建 `BookCopyForm` 组件
   - 根据 `type` 动态显示不同字段
   - 集成文件上传功能

5. **测试和文档** ⏳
   - 编写单元测试
   - 更新 API 文档
   - 测试数据迁移流程

---

## 🔍 关键设计决策

| 决策点 | 方案 | 理由 |
|--------|-----|------|
| **数据模型** | Book + BookCopy (组合模式) | 支持一书多载体，扩展性强 |
| **ISBN字段** | 可选 | 电子资源可能无ISBN |
| **库存管理** | 下沉到 BookCopy | 职责分离，符合单一职责原则 |
| **借阅关联** | BorrowRecord → BookCopy | 精确记录借的是纸质还是电子 |
| **电子书库存** | 无限制 | 避免复杂的并发控制逻辑 |
| **类型验证** | 实体内部验证 | 确保领域规则一致性 |

---

## 📚 相关文件清单

### 已修改/创建的文件：

#### 数据库层:
- ✅ `apps/api/prisma/schema.prisma`

#### 领域层:
- ✅ `apps/api/src/modules/book/domain/entities/book-copy.entity.ts` (新增)
- ✅ `apps/api/src/modules/book/domain/entities/book.entity.ts` (简化)
- ✅ `apps/api/src/modules/book/domain/repositories/book-copy.repository.interface.ts` (新增)

#### 基础设施层:
- ✅ `apps/api/src/modules/book/infrastructure/repositories/book-copy.repository.ts` (新增)
- ✅ `apps/api/src/modules/book/infrastructure/repositories/book.repository.ts` (调整)

#### 应用层:
- ✅ `apps/api/src/modules/book/application/dto/book-copy.dto.ts` (新增)
- ✅ `apps/api/src/modules/book/application/dto/book.dto.ts` (调整)
- ✅ `apps/api/src/modules/book/application/use-cases/create-book-copy.use-case.ts` (新增)

---

## 🎉 总结

**完成度**: 约 70%
**核心架构**: ✅ 完成
**剩余工作**: 控制器、迁移脚本、前端集成
**预计完成时间**: 2-3 小时（经验丰富开发者）

**关键成果**:
1. ✅ 彻底解决了电子图书和纸质图书的业务逻辑混乱问题
2. ✅ 支持同一本书同时拥有纸质版和电子版
3. ✅ 符合 DDD 最佳实践和单一职责原则
4. ✅ 具备良好的扩展性（未来可轻松添加新载体类型，如有声书）

**风险提示**:
- ⚠️ **数据迁移风险**：务必完整备份现有数据
- ⚠️ **API 破坏性变更**：前端调用需同步修改
- ⚠️ **测试工作量**：需要覆盖所有场景（纸质/电子/混合）

---

**下一步行动**: 完成数据库迁移脚本 → 创建控制器 → 前端集成 → 测试
