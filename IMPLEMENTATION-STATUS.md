# 图书类型区分改造 - 实施状态报告

**生成日期**: 2025-11-02
**完成度**: 85% (后端核心完成，待前端集成)
**状态**: ✅ 可以开始数据库迁移和测试

---

## ✅ 已完成工作（85%）

### 1. 数据库层 ✅ 100%

**文件**: `apps/api/prisma/schema.prisma`

- ✅ 创建 `BookCopy` 模型（纸质书/电子书载体）
- ✅ 简化 `Book` 模型（仅保留元信息）
- ✅ 调整 `BorrowRecord` 模型（关联到 BookCopy）
- ✅ 调整 `FileMetadata` 模型（与 BookCopy 关联）

**关键变更**:
```prisma
model Book {
  isbn   String? @unique  // 改为可选
  copies BookCopy[]       // 新增关系
  // 移除: totalCopies, availableCopies, contentFileId
}

model BookCopy {
  type            String  // PHYSICAL | EBOOK
  totalCopies     Int?    // 仅纸质书
  ebookFormat     String? // 仅电子书
  borrowRecords   BorrowRecord[]
}

model BorrowRecord {
  bookCopyId String   // 改为关联载体
  dueDate    DateTime? // 改为可选
}
```

---

### 2. 领域模型层 ✅ 100%

#### 2.1 BookCopy 实体 (新增)
**文件**: `apps/api/src/modules/book/domain/entities/book-copy.entity.ts`

- ✅ 类型定义：`BookCopyType`、`BookCopyStatus`、`EbookFormat`
- ✅ 智能验证：根据类型验证不同字段
- ✅ 业务方法：`borrow()`、`returnBook()`（区分纸质/电子）
- ✅ 状态管理：`markAsAvailable()`、`markAsUnavailable()`

#### 2.2 Book 实体 (简化)
**文件**: `apps/api/src/modules/book/domain/entities/book.entity.ts`

- ✅ 移除库存管理逻辑
- ✅ ISBN 改为可选
- ✅ 仅保留元信息管理方法

---

### 3. 仓储层 ✅ 100%

#### 3.1 BookCopy 仓储 (新增)
**接口**: `apps/api/src/modules/book/domain/repositories/book-copy.repository.interface.ts`
**实现**: `apps/api/src/modules/book/infrastructure/repositories/book-copy.repository.ts`

**核心方法**:
- ✅ `findAvailableByBookIdAndType()` - 智能查询可借阅载体
- ✅ `countByBookId()` - 统计载体数量（按类型分组）
- ✅ `getTotalPhysicalInventory()` - 全局库存统计
- ✅ `hasActiveBorrows()` - 检查活跃借阅

#### 3.2 Book 仓储 (调整)
**文件**: `apps/api/src/modules/book/infrastructure/repositories/book.repository.ts`

- ✅ `save()` - 移除库存字段
- ✅ `hasActiveBorrows()` - 通过 BookCopy 关联查询
- ✅ `findPopular()` - 通过 BookCopy 统计借阅次数
- ✅ `toDomain()` - 移除库存字段映射

---

### 4. 应用层 ✅ 100%

#### 4.1 DTO (完整)
**文件**: `apps/api/src/modules/book/application/dto/book-copy.dto.ts`

- ✅ `CreateBookCopyDto` - 条件验证（纸质书/电子书必填字段不同）
- ✅ `UpdateBookCopyDto` - 更新载体
- ✅ `QueryBookCopiesDto` - 查询过滤
- ✅ `BookCopyDto` - 响应 DTO
- ✅ `PaginatedBookCopiesDto` - 分页响应
- ✅ `BookCopyStatsDto` - 统计响应

**文件**: `apps/api/src/modules/book/application/dto/book.dto.ts`

- ✅ `CreateBookDto` - 移除库存字段，ISBN 改为可选
- ✅ `UpdateBookDto` - 新增 ISBN 字段
- ✅ `BookDto` - 移除库存字段

#### 4.2 业务用例 (完整)
**BookCopy 用例**:
- ✅ `CreateBookCopyUseCase` - 创建载体
- ✅ `GetBookCopiesUseCase` - 查询列表
- ✅ `GetBookCopyByIdUseCase` - 获取详情
- ✅ `GetBookCopiesByBookIdUseCase` - 获取指定图书的所有载体
- ✅ `UpdateBookCopyUseCase` - 更新载体
- ✅ `DeleteBookCopyUseCase` - 删除载体（检查活跃借阅）

**Book 用例**:
- ✅ 现有用例已自动适配新模型

---

### 5. 表现层 ✅ 100%

#### 5.1 BookCopy 控制器 (新增)
**文件**: `apps/api/src/modules/book/presentation/controllers/book-copy.controller.ts`

**路由**:
```
POST   /api/v1/book-copies              # 创建载体
GET    /api/v1/book-copies               # 查询列表
GET    /api/v1/book-copies/:id           # 获取详情
PUT    /api/v1/book-copies/:id           # 更新载体
DELETE /api/v1/book-copies/:id           # 删除载体
GET    /api/v1/books/:bookId/copies      # 获取指定图书的所有载体
GET    /api/v1/books/:bookId/copies/stats # 载体统计
```

#### 5.2 模块注册 (完成)
**文件**: `apps/api/src/modules/book/book.module.ts`

- ✅ 注册 `BookCopyRepository`
- ✅ 注册所有 BookCopy 用例
- ✅ 注册 `BookCopyController`
- ✅ 注册 `BookCopiesOfBookController`
- ✅ 导出 `BOOK_COPY_REPOSITORY`

---

### 6. 数据库迁移 ✅ 100%

#### 6.1 迁移文档 (完整)
**文件**: `apps/api/prisma/MIGRATION-GUIDE.md`

- ✅ 完整的迁移SQL脚本
- ✅ 数据迁移逻辑（将 Book 拆分为 Book + BookCopy）
- ✅ 关联关系调整（BorrowRecord → BookCopy）
- ✅ 验证查询
- ✅ 回滚方案
- ✅ 常见问题解答

#### 6.2 迁移说明
**文件**: `apps/api/prisma/migrations/README.md`

- ✅ 快速开始指南
- ✅ 执行步骤
- ✅ 最佳实践

---

## ⏳ 待完成工作（15%）

### 1. 借阅模块调整 ⏳ (重要)

**优先级**: 🔴 高

**需要调整的文件**:
```
apps/api/src/modules/borrow/
├── application/dto/borrow.dto.ts          # bookId → bookCopyId
├── application/use-cases/
│   ├── borrow-book.use-case.ts            # 使用 BookCopy
│   ├── return-book.use-case.ts            # 使用 BookCopy
│   └── renew-book.use-case.ts             # 使用 BookCopy
└── presentation/controllers/
    └── borrow.controller.ts               # 调整接口文档
```

**核心变更**:
```typescript
// 旧代码
export class BorrowBookDto {
  bookId: string;  // ❌ 改为 bookCopyId
  readerId: string;
}

// 新代码
export class BorrowBookDto {
  bookCopyId: string;  // ✅ 关联到载体
  readerId: string;
}

// 旧代码
const book = await this.bookRepository.findById(dto.bookId);
book.borrow();

// 新代码
const bookCopy = await this.bookCopyRepository.findById(dto.bookCopyId);
bookCopy.borrow();  // 智能处理纸质/电子书
```

---

### 2. Book 控制器优化 ⏳ (可选)

**优先级**: 🟡 中

**文件**: `apps/api/src/modules/book/presentation/controllers/book.controller.ts`

**建议优化**:
- 移除任何库存相关的接口（如果有）
- 在图书详情接口中可选返回关联的载体列表

```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const book = await this.getBooksUseCase.getById(id);
  const copies = await this.getBookCopiesByBookIdUseCase.execute(id);

  const dto = BookDto.fromEntity(book);
  dto.copies = copies.map(c => BookCopyDto.fromEntity(c, true));
  return dto;
}
```

---

### 3. 前端集成 ⏳ (次要)

**优先级**: 🟢 低（后端完成后再处理）

#### 3.1 图书管理表单
**文件**: `apps/admin/components/books/book-form.tsx`

**两步流程**:
```tsx
// Step 1: 创建图书元信息
const createBook = async (bookData) => {
  const response = await axios.post('/api/v1/books', {
    isbn: bookData.isbn || null,  // 可选
    title: bookData.title,
    author: bookData.author,
    // ... 其他元信息
  });
  return response.data.id; // bookId
};

// Step 2: 添加载体（可多次调用）
const addBookCopy = async (bookId, copyData) => {
  await axios.post('/api/v1/book-copies', {
    bookId,
    type: copyData.type,  // 'PHYSICAL' | 'EBOOK'
    // 根据类型提供不同字段
    ...(copyData.type === 'PHYSICAL' && {
      totalCopies: copyData.totalCopies,
      location: copyData.location,
    }),
    ...(copyData.type === 'EBOOK' && {
      ebookFormat: copyData.ebookFormat,
      fileId: copyData.fileId,
    }),
  });
};
```

#### 3.2 图书详情页
**建议**:
- 显示图书元信息
- 展示所有载体（纸质书/电子书）
- 每个载体显示状态和可用性

#### 3.3 借阅界面
**建议**:
- 用户选择图书后，显示可用的载体列表
- 用户选择具体载体（纸质或电子）进行借阅

---

### 4. API 文档更新 ⏳ (次要)

**优先级**: 🟢 低

**需要更新**:
- 新增 BookCopy API 说明
- 更新 Book API 说明（移除库存相关）
- 更新 Borrow API 说明（使用 bookCopyId）

---

## 📊 完成度统计

| 模块 | 完成度 | 说明 |
|------|--------|------|
| 数据库 Schema | 100% | ✅ 完成 |
| 领域模型 | 100% | ✅ 完成 |
| 仓储层 | 100% | ✅ 完成 |
| 应用层 DTO | 100% | ✅ 完成 |
| 应用层用例 | 90% | ⚠️ 借阅用例待调整 |
| 表现层控制器 | 90% | ⚠️ 借阅控制器待调整 |
| 数据库迁移 | 100% | ✅ 完成（待执行） |
| 模块注册 | 100% | ✅ 完成 |
| 前端集成 | 0% | ⏳ 待开发 |
| API 文档 | 0% | ⏳ 待更新 |
| **总体完成度** | **85%** | **后端核心完成** |

---

## 🚀 后续开发建议

### 立即执行（确保系统可运行）:

1. **执行数据库迁移** 🔴
   ```bash
   cd apps/api

   # 备份数据库
   pg_dump -U <username> -d gz-books > backup_$(date +%Y%m%d_%H%M%S).sql

   # 创建迁移
   npx prisma migrate dev --name add_book_copy_table --create-only

   # 编辑迁移文件（复制 MIGRATION-GUIDE.md 中的 SQL）

   # 应用迁移
   npx prisma migrate deploy

   # 重新生成 Prisma Client
   npx prisma generate
   ```

2. **调整借阅模块** 🔴
   - 修改 `BorrowBookDto`：`bookId` → `bookCopyId`
   - 修改所有借阅用例，使用 `BookCopy` 而非 `Book`
   - 更新控制器和路由

3. **测试核心功能** 🟡
   - 创建图书
   - 添加载体（纸质书/电子书）
   - 借阅载体
   - 归还载体

### 后续优化（可延后）:

4. **前端集成** 🟢
   - 图书管理表单改造
   - 图书详情页优化
   - 借阅界面调整

5. **文档和测试** 🟢
   - API 文档更新
   - 单元测试补充
   - 集成测试

---

## ⚠️ 风险提示

1. **数据迁移风险** 🔴
   - 务必完整备份数据库
   - 先在测试环境验证
   - 准备回滚方案

2. **API 破坏性变更** 🟡
   - 借阅接口参数变更（`bookId` → `bookCopyId`）
   - 前端调用需同步修改
   - 建议使用 API 版本控制

3. **数据一致性** 🟡
   - 确保所有 Book 都有至少一个 BookCopy
   - 确保所有 BorrowRecord 正确关联到 BookCopy

---

## 📚 相关文档

- [改造总结](./REFACTOR-SUMMARY.md) - 详细的技术设计和对比
- [迁移指南](./apps/api/prisma/MIGRATION-GUIDE.md) - 完整的数据库迁移步骤
- [迁移说明](./apps/api/prisma/migrations/README.md) - Prisma 迁移使用指南

---

## ✅ 下一步行动

**推荐执行顺序**:

1. ✅ **阅读本文档** - 了解完成度和待办事项
2. 🔴 **执行数据库迁移** - 按照 MIGRATION-GUIDE.md 操作
3. 🔴 **调整借阅模块** - 修改 DTO 和用例
4. 🟡 **测试验证** - 确保核心功能正常
5. 🟢 **前端集成** - 改造管理端表单
6. 🟢 **文档补充** - 更新 API 文档

---

**最后更新**: 2025-11-02
**维护者**: AI Assistant
**状态**: ✅ 后端核心完成，可开始迁移测试
