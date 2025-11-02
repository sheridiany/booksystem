# 高斯图书借阅系统 - DDD 领域架构设计

**版本**: v1.0
**创建日期**: 2025-11-02
**架构模式**: 领域驱动设计 (DDD) + Monorepo

---

## 一、DDD 设计原则

### 1.1 核心原则

```yaml
实用主义DDD:
  - ✅ 聚焦核心领域逻辑，避免过度抽象
  - ✅ 最简实现：拒绝微内核、CQRS等复杂模式 (除非业务真需要)
  - ✅ 实体 + 仓储 + 服务三层足矣
  - ❌ 不引入领域事件、事件溯源等"理论完美"的复杂方案
  - ✅ 向后兼容：领域模型演进不破坏现有接口
```

### 1.2 架构分层

```
┌─────────────────────────────────────┐
│   Presentation Layer (表现层)       │  ← Next.js (apps/admin, apps/reader)
│   - Controllers / API Routes        │
│   - DTO / Request/Response          │
├─────────────────────────────────────┤
│   Application Layer (应用层)        │  ← NestJS Services
│   - Use Cases (业务用例)            │
│   - Application Services            │
│   - DTO Transformers                │
├─────────────────────────────────────┤
│   Domain Layer (领域层)             │  ← 核心业务逻辑
│   - Entities (实体)                 │
│   - Value Objects (值对象)          │
│   - Domain Services (领域服务)      │
│   - Repository Interfaces           │
├─────────────────────────────────────┤
│   Infrastructure Layer (基础设施层)  │  ← 技术实现
│   - Repository Implementations      │
│   - Database (openGauss + Prisma)   │
│   - File Storage (/uploads)         │
│   - External Services               │
└─────────────────────────────────────┘
```

**简化说明**:
- **表现层**: 处理HTTP请求/响应，数据校验
- **应用层**: 编排领域对象，实现业务用例
- **领域层**: 纯业务逻辑，与技术无关
- **基础设施层**: 数据持久化、外部API调用

---

## 二、领域划分 (Bounded Context)

### 2.1 核心子域 (Core Domain)

#### 📚 图书领域 (Book Domain)

**职责**: 图书信息管理、分类管理

**核心实体**:
- `Book` (图书)
- `Category` (分类)
- `BookFile` (图书文件)

**核心用例**:
- 创建/更新/删除图书
- 上传图书文件
- 查询图书 (检索、分类浏览)
- 管理分类

---

#### 📖 借阅领域 (Borrow Domain)

**职责**: 借阅全流程管理 (借出、归还、续借、逾期)

**核心实体**:
- `BorrowRecord` (借阅记录)
- `BorrowPolicy` (借阅策略 - 值对象)

**核心用例**:
- 办理借阅
- 办理归还
- 办理续借
- 计算逾期
- 查询借阅记录

**领域服务**:
- `BorrowDomainService`: 借阅规则校验 (库存检查、借阅上限、逾期检查)

---

### 2.2 支撑子域 (Supporting Domain)

#### 👤 读者领域 (Reader Domain)

**职责**: 读者信息管理、借阅权限

**核心实体**:
- `Reader` (读者)

**核心用例**:
- 创建/更新/删除读者
- 查询读者信息
- 管理借阅权限

---

#### 🔐 认证领域 (Auth Domain)

**职责**: 用户认证、授权、角色管理

**核心实体**:
- `User` (用户)
- `Role` (角色 - 值对象)

**核心用例**:
- 登录/登出
- JWT生成/验证
- 角色权限校验

---

#### 📁 文件领域 (File Domain)

**职责**: 文件上传、存储、元数据管理

**核心实体**:
- `FileMetadata` (文件元数据)

**核心用例**:
- 上传文件 (PDF/EPUB/图片)
- 生成文件访问URL
- 文件类型/大小校验
- 文件删除

---

### 2.3 领域关系图

```
┌──────────────┐
│  Auth Domain │──────┐
│  (认证)      │      │
└──────────────┘      │
                       ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Reader Domain│──→│ Borrow Domain│←──│  Book Domain │
│  (读者)      │   │  (借阅)      │   │  (图书)      │
└──────────────┘   └──────────────┘   └──────┬───────┘
                                              │
                                              ↓
                                       ┌──────────────┐
                                       │  File Domain │
                                       │  (文件)      │
                                       └──────────────┘

依赖关系:
- Borrow Domain 依赖 Book Domain (检查库存)
- Borrow Domain 依赖 Reader Domain (检查借阅权限)
- Book Domain 依赖 File Domain (文件关联)
- 所有领域依赖 Auth Domain (权限校验)
```

---

## 三、领域模型详细设计

### 3.1 图书领域 (Book Domain)

#### 实体: Book (图书)

```typescript
// apps/api/src/modules/book/domain/entities/book.entity.ts

export class Book {
  // 标识
  private readonly id: string;

  // 基本信息
  private isbn: ISBN;                    // 值对象
  private title: string;
  private author: string;
  private publisher: string;

  // 关联
  private categoryId: string;
  private coverFileId?: string;
  private contentFileId?: string;        // 关联 FileMetadata

  // 库存
  private totalCopies: number;
  private availableCopies: number;

  // 元数据
  private description?: string;
  private publishDate?: Date;
  private createdAt: Date;
  private updatedAt: Date;

  // 领域行为
  borrow(): void {
    if (this.availableCopies <= 0) {
      throw new DomainException('图书库存不足');
    }
    this.availableCopies--;
  }

  returnBook(): void {
    if (this.availableCopies >= this.totalCopies) {
      throw new DomainException('归还数量异常');
    }
    this.availableCopies++;
  }

  isAvailable(): boolean {
    return this.availableCopies > 0;
  }

  updateInventory(totalCopies: number): void {
    const borrowedCopies = this.totalCopies - this.availableCopies;
    this.totalCopies = totalCopies;
    this.availableCopies = totalCopies - borrowedCopies;
  }
}
```

#### 值对象: ISBN

```typescript
// apps/api/src/modules/book/domain/value-objects/isbn.vo.ts

export class ISBN {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValidISBN(value)) {
      throw new DomainException('无效的ISBN格式');
    }
    this.value = value;
  }

  private isValidISBN(value: string): boolean {
    // 简化校验: ISBN-10 或 ISBN-13
    const cleaned = value.replace(/[-\s]/g, '');
    return /^\d{10}(\d{3})?$/.test(cleaned);
  }

  toString(): string {
    return this.value;
  }

  equals(other: ISBN): boolean {
    return this.value === other.value;
  }
}
```

#### 实体: Category (分类)

```typescript
// apps/api/src/modules/book/domain/entities/category.entity.ts

export class Category {
  private readonly id: string;
  private name: string;
  private parentId?: string;    // 支持层级分类
  private sort: number;
  private createdAt: Date;
  private updatedAt: Date;

  // 简单实现,无复杂树形逻辑
  isRootCategory(): boolean {
    return !this.parentId;
  }
}
```

#### 仓储接口: BookRepository

```typescript
// apps/api/src/modules/book/domain/repositories/book.repository.ts

export interface IBookRepository {
  // 基础CRUD
  save(book: Book): Promise<Book>;
  findById(id: string): Promise<Book | null>;
  findByISBN(isbn: ISBN): Promise<Book | null>;
  delete(id: string): Promise<void>;

  // 查询
  findAll(params: {
    page: number;
    limit: number;
    categoryId?: string;
    keyword?: string;
  }): Promise<{ books: Book[]; total: number }>;

  // 领域特定方法
  findAvailableBooks(): Promise<Book[]>;
}
```

---

### 3.2 借阅领域 (Borrow Domain)

#### 实体: BorrowRecord (借阅记录)

```typescript
// apps/api/src/modules/borrow/domain/entities/borrow-record.entity.ts

export enum BorrowStatus {
  BORROWED = 'BORROWED',   // 借出中
  RETURNED = 'RETURNED',   // 已归还
  OVERDUE = 'OVERDUE',     // 逾期
}

export class BorrowRecord {
  private readonly id: string;

  // 关联
  private bookId: string;
  private readerId: string;

  // 时间信息
  private borrowDate: Date;
  private dueDate: Date;
  private returnDate?: Date;

  // 状态
  private status: BorrowStatus;
  private renewCount: number;
  private maxRenewCount: number;  // 从 BorrowPolicy 初始化

  // 元数据
  private createdAt: Date;
  private updatedAt: Date;

  // 领域行为
  renew(policy: BorrowPolicy): void {
    if (this.status !== BorrowStatus.BORROWED) {
      throw new DomainException('只能续借借出中的图书');
    }
    if (this.renewCount >= this.maxRenewCount) {
      throw new DomainException(`最多续借${this.maxRenewCount}次`);
    }
    if (this.isOverdue()) {
      throw new DomainException('逾期图书不可续借');
    }

    this.renewCount++;
    this.dueDate = policy.calculateNewDueDate(this.dueDate);
  }

  returnBook(): void {
    if (this.status === BorrowStatus.RETURNED) {
      throw new DomainException('图书已归还');
    }

    this.returnDate = new Date();
    this.status = BorrowStatus.RETURNED;
  }

  isOverdue(): boolean {
    if (this.status === BorrowStatus.RETURNED) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  // 自动更新逾期状态
  checkAndUpdateOverdueStatus(): void {
    if (this.isOverdue() && this.status === BorrowStatus.BORROWED) {
      this.status = BorrowStatus.OVERDUE;
    }
  }
}
```

#### 值对象: BorrowPolicy (借阅策略)

```typescript
// apps/api/src/modules/borrow/domain/value-objects/borrow-policy.vo.ts

export class BorrowPolicy {
  private readonly borrowDays: number;        // 借阅天数
  private readonly maxRenewCount: number;     // 最大续借次数
  private readonly maxBorrowLimit: number;    // 单人最大借阅数

  constructor(
    borrowDays: number = 30,
    maxRenewCount: number = 2,
    maxBorrowLimit: number = 5,
  ) {
    this.borrowDays = borrowDays;
    this.maxRenewCount = maxRenewCount;
    this.maxBorrowLimit = maxBorrowLimit;
  }

  calculateDueDate(borrowDate: Date): Date {
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + this.borrowDays);
    return dueDate;
  }

  calculateNewDueDate(currentDueDate: Date): Date {
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + this.borrowDays);
    return newDueDate;
  }

  getMaxRenewCount(): number {
    return this.maxRenewCount;
  }

  getMaxBorrowLimit(): number {
    return this.maxBorrowLimit;
  }
}
```

#### 领域服务: BorrowDomainService

```typescript
// apps/api/src/modules/borrow/domain/services/borrow-domain.service.ts

export class BorrowDomainService {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly borrowRepository: IBorrowRepository,
    private readonly readerRepository: IReaderRepository,
  ) {}

  // 校验是否可借阅
  async canBorrow(
    readerId: string,
    bookId: string,
    policy: BorrowPolicy,
  ): Promise<{ canBorrow: boolean; reason?: string }> {
    // 1. 检查图书库存
    const book = await this.bookRepository.findById(bookId);
    if (!book || !book.isAvailable()) {
      return { canBorrow: false, reason: '图书库存不足' };
    }

    // 2. 检查读者借阅数量
    const activeRecords = await this.borrowRepository.findActiveByReaderId(readerId);
    if (activeRecords.length >= policy.getMaxBorrowLimit()) {
      return { canBorrow: false, reason: `最多借阅${policy.getMaxBorrowLimit()}本` };
    }

    // 3. 检查是否重复借阅
    const hasBorrowed = activeRecords.some(record => record.bookId === bookId);
    if (hasBorrowed) {
      return { canBorrow: false, reason: '该图书已借阅' };
    }

    // 4. 检查读者状态
    const reader = await this.readerRepository.findById(readerId);
    if (!reader || !reader.isActive()) {
      return { canBorrow: false, reason: '读者账号异常' };
    }

    return { canBorrow: true };
  }
}
```

#### 仓储接口: BorrowRepository

```typescript
// apps/api/src/modules/borrow/domain/repositories/borrow.repository.ts

export interface IBorrowRepository {
  save(record: BorrowRecord): Promise<BorrowRecord>;
  findById(id: string): Promise<BorrowRecord | null>;
  delete(id: string): Promise<void>;

  // 查询
  findByReaderId(readerId: string): Promise<BorrowRecord[]>;
  findActiveByReaderId(readerId: string): Promise<BorrowRecord[]>;
  findOverdueRecords(): Promise<BorrowRecord[]>;

  // 统计
  countActiveByReaderId(readerId: string): Promise<number>;
}
```

---

### 3.3 读者领域 (Reader Domain)

#### 实体: Reader (读者)

```typescript
// apps/api/src/modules/reader/domain/entities/reader.entity.ts

export enum ReaderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class Reader {
  private readonly id: string;
  private userId: string;           // 关联 User
  private name: string;
  private studentId?: string;
  private phone?: string;
  private email?: string;
  private status: ReaderStatus;
  private maxBorrowLimit: number;   // 个性化借阅上限
  private createdAt: Date;
  private updatedAt: Date;

  isActive(): boolean {
    return this.status === ReaderStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = ReaderStatus.INACTIVE;
  }

  activate(): void {
    this.status = ReaderStatus.ACTIVE;
  }

  updateBorrowLimit(limit: number): void {
    if (limit < 0) {
      throw new DomainException('借阅上限不能为负数');
    }
    this.maxBorrowLimit = limit;
  }
}
```

---

### 3.4 认证领域 (Auth Domain)

#### 实体: User (用户)

```typescript
// apps/api/src/modules/auth/domain/entities/user.entity.ts

export enum UserRole {
  ADMIN = 'ADMIN',       // 管理员
  READER = 'READER',     // 读者
}

export class User {
  private readonly id: string;
  private username: string;
  private passwordHash: string;
  private role: UserRole;
  private isActive: boolean;
  private lastLoginAt?: Date;
  private createdAt: Date;
  private updatedAt: Date;

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isReader(): boolean {
    return this.role === UserRole.READER;
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }

  // 密码校验由应用层处理 (使用 bcrypt)
}
```

---

### 3.5 文件领域 (File Domain)

#### 实体: FileMetadata (文件元数据)

```typescript
// apps/api/src/modules/file/domain/entities/file-metadata.entity.ts

export enum FileType {
  PDF = 'pdf',
  EPUB = 'epub',
  IMAGE = 'image',
  OTHER = 'other',
}

export class FileMetadata {
  private readonly id: string;
  private originalName: string;
  private storedName: string;        // 存储时的文件名 (UUID)
  private filePath: string;          // 相对路径 (如 /uploads/books/xxx.pdf)
  private fileType: FileType;
  private mimeType: string;
  private size: number;              // 字节
  private uploadedBy: string;        // 上传者ID
  private createdAt: Date;

  getFileUrl(baseUrl: string): string {
    return `${baseUrl}${this.filePath}`;
  }

  isPreviewable(): boolean {
    return this.fileType === FileType.PDF || this.fileType === FileType.EPUB;
  }

  // 文件大小限制校验
  static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  static validateFileSize(size: number): void {
    if (size > FileMetadata.MAX_FILE_SIZE) {
      throw new DomainException('文件大小超过限制 (100MB)');
    }
  }
}
```

---

## 四、应用层设计 (Use Cases)

### 4.1 图书用例

```typescript
// apps/api/src/modules/book/application/use-cases/create-book.use-case.ts

export class CreateBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateBookDto): Promise<BookDto> {
    // 1. 校验分类存在
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 2. 校验ISBN唯一性
    const isbn = new ISBN(dto.isbn);
    const existingBook = await this.bookRepository.findByISBN(isbn);
    if (existingBook) {
      throw new ConflictException('ISBN已存在');
    }

    // 3. 创建图书实体
    const book = new Book({
      isbn,
      title: dto.title,
      author: dto.author,
      publisher: dto.publisher,
      categoryId: dto.categoryId,
      totalCopies: dto.totalCopies,
      availableCopies: dto.totalCopies,
      description: dto.description,
    });

    // 4. 持久化
    const savedBook = await this.bookRepository.save(book);

    // 5. 返回DTO
    return BookDto.fromEntity(savedBook);
  }
}
```

### 4.2 借阅用例

```typescript
// apps/api/src/modules/borrow/application/use-cases/borrow-book.use-case.ts

export class BorrowBookUseCase {
  constructor(
    private readonly borrowRepository: IBorrowRepository,
    private readonly bookRepository: IBookRepository,
    private readonly borrowDomainService: BorrowDomainService,
  ) {}

  async execute(dto: BorrowBookDto): Promise<BorrowRecordDto> {
    // 1. 获取借阅策略 (可从配置读取)
    const policy = new BorrowPolicy();

    // 2. 领域服务校验
    const { canBorrow, reason } = await this.borrowDomainService.canBorrow(
      dto.readerId,
      dto.bookId,
      policy,
    );
    if (!canBorrow) {
      throw new BadRequestException(reason);
    }

    // 3. 创建借阅记录
    const borrowDate = new Date();
    const dueDate = policy.calculateDueDate(borrowDate);

    const record = new BorrowRecord({
      bookId: dto.bookId,
      readerId: dto.readerId,
      borrowDate,
      dueDate,
      status: BorrowStatus.BORROWED,
      renewCount: 0,
      maxRenewCount: policy.getMaxRenewCount(),
    });

    // 4. 扣减库存
    const book = await this.bookRepository.findById(dto.bookId);
    book.borrow();
    await this.bookRepository.save(book);

    // 5. 持久化借阅记录
    const savedRecord = await this.borrowRepository.save(record);

    return BorrowRecordDto.fromEntity(savedRecord);
  }
}
```

---

## 五、基础设施层设计

### 5.1 数据库设计 (Prisma Schema)

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // openGauss 兼容 PostgreSQL
  url      = env("DATABASE_URL")
}

// ========== 用户与认证 ==========
model User {
  id           String    @id @default(uuid())
  username     String    @unique
  passwordHash String    @map("password_hash")
  role         String    // ADMIN | READER
  isActive     Boolean   @default(true) @map("is_active")
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  reader Reader?

  @@map("users")
}

// ========== 读者 ==========
model Reader {
  id             String   @id @default(uuid())
  userId         String   @unique @map("user_id")
  name           String
  studentId      String?  @map("student_id")
  phone          String?
  email          String?
  status         String   @default("ACTIVE") // ACTIVE | INACTIVE
  maxBorrowLimit Int      @default(5) @map("max_borrow_limit")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  borrowRecords  BorrowRecord[]

  @@map("readers")
}

// ========== 图书分类 ==========
model Category {
  id        String   @id @default(uuid())
  name      String
  parentId  String?  @map("parent_id")
  sort      Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  books Book[]

  @@map("categories")
}

// ========== 图书 ==========
model Book {
  id               String   @id @default(uuid())
  isbn             String   @unique
  title            String
  author           String
  publisher        String
  categoryId       String   @map("category_id")
  totalCopies      Int      @map("total_copies")
  availableCopies  Int      @map("available_copies")
  coverFileId      String?  @map("cover_file_id")
  contentFileId    String?  @map("content_file_id")
  description      String?  @db.Text
  publishDate      DateTime? @map("publish_date")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  category      Category        @relation(fields: [categoryId], references: [id])
  coverFile     FileMetadata?   @relation("BookCover", fields: [coverFileId], references: [id])
  contentFile   FileMetadata?   @relation("BookContent", fields: [contentFileId], references: [id])
  borrowRecords BorrowRecord[]

  @@index([categoryId])
  @@index([title])
  @@map("books")
}

// ========== 借阅记录 ==========
model BorrowRecord {
  id         String    @id @default(uuid())
  bookId     String    @map("book_id")
  readerId   String    @map("reader_id")
  borrowDate DateTime  @map("borrow_date")
  dueDate    DateTime  @map("due_date")
  returnDate DateTime? @map("return_date")
  renewCount Int       @default(0) @map("renew_count")
  status     String    // BORROWED | RETURNED | OVERDUE
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  book   Book   @relation(fields: [bookId], references: [id])
  reader Reader @relation(fields: [readerId], references: [id])

  @@index([readerId])
  @@index([bookId])
  @@index([status])
  @@map("borrow_records")
}

// ========== 文件元数据 ==========
model FileMetadata {
  id           String   @id @default(uuid())
  originalName String   @map("original_name")
  storedName   String   @map("stored_name")
  filePath     String   @map("file_path")
  fileType     String   @map("file_type") // pdf | epub | image | other
  mimeType     String   @map("mime_type")
  size         Int
  uploadedBy   String   @map("uploaded_by")
  createdAt    DateTime @default(now()) @map("created_at")

  booksAsCover   Book[] @relation("BookCover")
  booksAsContent Book[] @relation("BookContent")

  @@map("file_metadata")
}
```

### 5.2 仓储实现示例

```typescript
// apps/api/src/modules/book/infrastructure/repositories/book.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IBookRepository } from '../../domain/repositories/book.repository';
import { Book } from '../../domain/entities/book.entity';
import { ISBN } from '../../domain/value-objects/isbn.vo';

@Injectable()
export class BookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(book: Book): Promise<Book> {
    const data = {
      id: book.id,
      isbn: book.isbn.toString(),
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      categoryId: book.categoryId,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      // ... 其他字段
    };

    const savedBook = await this.prisma.book.upsert({
      where: { id: book.id },
      create: data,
      update: data,
    });

    return this.toDomain(savedBook);
  }

  async findById(id: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    return book ? this.toDomain(book) : null;
  }

  async findByISBN(isbn: ISBN): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({
      where: { isbn: isbn.toString() },
    });
    return book ? this.toDomain(book) : null;
  }

  private toDomain(prismaBook: any): Book {
    return new Book({
      id: prismaBook.id,
      isbn: new ISBN(prismaBook.isbn),
      title: prismaBook.title,
      // ... 其他映射
    });
  }
}
```

---

## 六、NestJS 模块结构

### 6.1 目录结构

```
apps/api/src/
├── main.ts
├── app.module.ts
│
├── modules/
│   ├── book/                       # 图书模块
│   │   ├── book.module.ts
│   │   ├── domain/                 # 领域层
│   │   │   ├── entities/
│   │   │   │   ├── book.entity.ts
│   │   │   │   └── category.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   └── isbn.vo.ts
│   │   │   └── repositories/
│   │   │       └── book.repository.ts (接口)
│   │   ├── application/            # 应用层
│   │   │   ├── use-cases/
│   │   │   │   ├── create-book.use-case.ts
│   │   │   │   ├── update-book.use-case.ts
│   │   │   │   └── delete-book.use-case.ts
│   │   │   └── dto/
│   │   │       ├── create-book.dto.ts
│   │   │       └── book.dto.ts
│   │   ├── infrastructure/         # 基础设施层
│   │   │   └── repositories/
│   │   │       └── book.repository.ts (实现)
│   │   └── presentation/           # 表现层
│   │       └── controllers/
│   │           └── book.controller.ts
│   │
│   ├── borrow/                     # 借阅模块
│   │   ├── borrow.module.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── borrow-record.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   └── borrow-policy.vo.ts
│   │   │   ├── services/
│   │   │   │   └── borrow-domain.service.ts
│   │   │   └── repositories/
│   │   │       └── borrow.repository.ts
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── reader/                     # 读者模块
│   ├── auth/                       # 认证模块
│   └── file/                       # 文件模块
│
├── shared/                         # 共享模块
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── exceptions/
│   │   └── domain.exception.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
│
└── config/
    └── database.config.ts
```

### 6.2 模块示例

```typescript
// apps/api/src/modules/book/book.module.ts

import { Module } from '@nestjs/common';
import { BookController } from './presentation/controllers/book.controller';
import { CreateBookUseCase } from './application/use-cases/create-book.use-case';
import { BookRepository } from './infrastructure/repositories/book.repository';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookController],
  providers: [
    // Use Cases
    CreateBookUseCase,
    UpdateBookUseCase,
    // ... 其他用例

    // Repositories
    {
      provide: 'IBookRepository',
      useClass: BookRepository,
    },
  ],
  exports: ['IBookRepository'], // 供其他模块使用
})
export class BookModule {}
```

---

## 七、前端架构 (Monorepo)

### 7.1 目录结构

```
apps/
├── admin/                          # 管理端
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── books/
│   │   │   ├── borrows/
│   │   │   ├── readers/
│   │   │   └── stats/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── book-form.tsx
│   │   ├── borrow-table.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api/                    # API调用
│   │   ├── hooks/                  # 自定义hooks
│   │   └── utils/
│   └── public/
│
├── reader/                         # 用户端
│   ├── app/
│   │   ├── books/
│   │   ├── my-borrows/
│   │   ├── preview/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── book-card.tsx
│   │   ├── pdf-viewer.tsx
│   │   ├── epub-reader.tsx
│   │   └── ...
│   └── lib/
│
└── api/                            # NestJS后端

packages/
├── ui/                             # 共享UI组件
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...                     # shadcn/ui组件
│   └── styles/
│       └── globals.css
│
├── types/                          # 共享类型
│   ├── book.ts
│   ├── borrow.ts
│   └── user.ts
│
└── utils/                          # 共享工具
    ├── date.ts
    ├── format.ts
    └── validators.ts
```

### 7.2 文件预览组件

```typescript
// apps/reader/components/pdf-viewer.tsx

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  return (
    <div className="pdf-viewer">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={pageNumber} />
      </Document>

      <div className="controls">
        <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}>
          上一页
        </button>
        <span>{pageNumber} / {numPages}</span>
        <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}>
          下一页
        </button>
      </div>
    </div>
  );
}
```

```typescript
// apps/reader/components/epub-reader.tsx

import { ReactReader } from 'react-reader';

export function EPUBReader({ fileUrl }: { fileUrl: string }) {
  const [location, setLocation] = useState<string | number>(0);

  return (
    <div className="epub-reader" style={{ height: '100vh' }}>
      <ReactReader
        url={fileUrl}
        location={location}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
      />
    </div>
  );
}
```

---

## 八、API 接口设计

### 8.1 RESTful API 规范

```yaml
基础URL: /api/v1

认证:
  POST /auth/login              # 登录
  POST /auth/logout             # 登出
  GET  /auth/me                 # 获取当前用户

图书管理:
  GET    /books                 # 图书列表
  GET    /books/:id             # 图书详情
  POST   /books                 # 创建图书 [ADMIN]
  PUT    /books/:id             # 更新图书 [ADMIN]
  DELETE /books/:id             # 删除图书 [ADMIN]
  POST   /books/:id/file        # 上传图书文件 [ADMIN]

分类管理:
  GET    /categories            # 分类列表
  POST   /categories            # 创建分类 [ADMIN]
  PUT    /categories/:id        # 更新分类 [ADMIN]
  DELETE /categories/:id        # 删除分类 [ADMIN]

借阅管理:
  POST   /borrows               # 办理借阅 [ADMIN]
  PUT    /borrows/:id/return    # 办理归还 [ADMIN]
  PUT    /borrows/:id/renew     # 办理续借 [ADMIN/READER]
  GET    /borrows               # 借阅记录 [ADMIN: 全部, READER: 仅自己]
  GET    /borrows/overdue       # 逾期记录 [ADMIN]

读者管理:
  GET    /readers               # 读者列表 [ADMIN]
  GET    /readers/:id           # 读者详情 [ADMIN/READER(self)]
  POST   /readers               # 创建读者 [ADMIN]
  PUT    /readers/:id           # 更新读者 [ADMIN]
  DELETE /readers/:id           # 删除读者 [ADMIN]

文件管理:
  POST   /files/upload          # 上传文件 [ADMIN]
  GET    /files/:id             # 获取文件URL
  DELETE /files/:id             # 删除文件 [ADMIN]

统计报表:
  GET    /stats/borrows         # 借阅统计 [ADMIN]
  GET    /stats/books           # 图书统计 [ADMIN]
  GET    /stats/popular         # 热门图书 [ADMIN]
```

### 8.2 响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-02T12:00:00Z"
}

// 分页响应
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "BOOK_NOT_FOUND",
    "message": "图书不存在",
    "details": { ... }
  },
  "timestamp": "2025-01-02T12:00:00Z"
}
```

---

## 九、部署架构

### 9.1 开发环境

```yaml
Monorepo:
  - pnpm dev (启动所有应用)

独立启动:
  - apps/admin:  pnpm --filter admin dev
  - apps/reader: pnpm --filter reader dev
  - apps/api:    pnpm --filter api dev

数据库:
  - Docker Compose 启动 openGauss
  - Prisma Migrate 迁移
```

### 9.2 生产环境

```yaml
前端 (Next.js):
  - 静态导出 or SSR部署
  - Nginx反向代理

后端 (NestJS):
  - PM2 / Docker 部署
  - Nginx反向代理

数据库:
  - openGauss 独立部署

文件存储:
  - 本地 /uploads (挂载到持久卷)
  - 可选: 迁移至对象存储 (向后兼容)
```

---

## 十、总结

### 10.1 DDD实用化要点

✅ **做什么**:
- 清晰的领域边界 (Bounded Context)
- 领域实体封装业务逻辑
- 仓储模式隔离持久化
- 领域服务处理跨实体逻辑

❌ **不做什么**:
- 不引入领域事件 (除非真需要异步解耦)
- 不引入CQRS (除非读写差异巨大)
- 不引入事件溯源 (过度复杂)
- 不引入微内核架构 (理论完美,实际复杂)

### 10.2 向后兼容策略

```yaml
数据库:
  - Prisma Migration 版本化
  - 新增字段使用可选类型
  - 删除字段先标记废弃

API:
  - URL版本化 (/api/v1, /api/v2)
  - 新字段向后兼容
  - 废弃字段保留至少一个版本

文件存储:
  - 支持多种存储适配器 (本地 / 对象存储)
  - 统一接口,可平滑迁移
```

---

**文档结束**
