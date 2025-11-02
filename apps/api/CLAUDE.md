[根目录](../../CLAUDE.md) > [apps](../) > **api**

---

# apps/api - NestJS 后端模块

**职责**: 后端 API 服务，采用 DDD 架构，提供 RESTful 接口
**框架**: NestJS 10.4.15
**数据库**: openGauss / PostgreSQL (Prisma 6.2.1)
**端口**: 3000
**API 前缀**: `/api/v1`

---

## 变更记录 (Changelog)

### 2025-11-02 12:30:16 - 初始化模块文档
- 创建 CLAUDE.md 文档
- 完成脚手架搭建：基础 NestJS 结构 + Prisma Schema
- 配置 JWT 认证、全局验证管道、CORS

---

## 一、模块职责

### 核心功能
1. **图书管理 API** (Book Domain)
   - 图书 CRUD、分类管理、文件关联
   - 库存管理、检索接口

2. **借阅管理 API** (Borrow Domain)
   - 借阅办理、归还、续借
   - 逾期检查、借阅记录查询

3. **读者管理 API** (Reader Domain)
   - 读者信息 CRUD
   - 借阅权限管理

4. **认证与授权** (Auth Domain)
   - JWT 登录/登出
   - 角色权限控制 (ADMIN / READER)

5. **文件管理** (File Domain)
   - 文件上传 (PDF/EPUB/图片)
   - 文件元数据管理
   - 文件访问 URL 生成

### DDD 架构分层
```
表现层 (Presentation)
  └─ Controllers: 处理 HTTP 请求，数据校验

应用层 (Application)
  └─ Use Cases: 业务用例编排，DTO 转换

领域层 (Domain)
  ├─ Entities: 核心业务实体 (Book, BorrowRecord 等)
  ├─ Value Objects: 值对象 (ISBN, BorrowPolicy)
  ├─ Domain Services: 领域服务 (BorrowDomainService)
  └─ Repository Interfaces: 仓储接口定义

基础设施层 (Infrastructure)
  ├─ Repository Implementations: Prisma 仓储实现
  ├─ Database: openGauss + Prisma
  └─ File Storage: /uploads 目录
```

---

## 二、入口与启动

### 入口文件
- **主入口**: `src/main.ts`
  - 创建 NestJS 应用
  - 配置全局验证管道 (`ValidationPipe`)
  - 启用 CORS
  - 设置全局 API 前缀 `/api/v1`
  - 监听端口 3000

### 启动命令
```bash
# 开发模式 (热重载)
pnpm dev
# 或
pnpm start:debug   # 带调试

# 构建
pnpm build

# 生产模式
pnpm start:prod
```

### 环境变量
需要配置 `.env` 文件：
```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/gz-books"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3001,http://localhost:3002"

# 文件上传
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=104857600  # 100MB

# 服务端口
PORT=3000
```

---

## 三、对外接口

### API 路由规范
**基础 URL**: `http://localhost:3000/api/v1`

#### 认证接口
```typescript
POST   /auth/login        # 登录
POST   /auth/logout       # 登出
GET    /auth/me           # 获取当前用户信息
```

#### 图书管理接口
```typescript
GET    /books             # 图书列表 (分页、搜索、分类过滤)
GET    /books/:id         # 图书详情
POST   /books             # 创建图书 [ADMIN]
PUT    /books/:id         # 更新图书 [ADMIN]
DELETE /books/:id         # 删除图书 [ADMIN]
POST   /books/:id/file    # 上传图书文件 [ADMIN]
```

#### 分类管理接口
```typescript
GET    /categories        # 分类列表
POST   /categories        # 创建分类 [ADMIN]
PUT    /categories/:id    # 更新分类 [ADMIN]
DELETE /categories/:id    # 删除分类 [ADMIN]
```

#### 借阅管理接口
```typescript
POST   /borrows           # 办理借阅 [ADMIN]
PUT    /borrows/:id/return   # 办理归还 [ADMIN]
PUT    /borrows/:id/renew    # 办理续借 [ADMIN/READER]
GET    /borrows           # 借阅记录 [ADMIN: 全部, READER: 仅自己]
GET    /borrows/overdue   # 逾期记录 [ADMIN]
```

#### 读者管理接口
```typescript
GET    /readers           # 读者列表 [ADMIN]
GET    /readers/:id       # 读者详情 [ADMIN/READER(self)]
POST   /readers           # 创建读者 [ADMIN]
PUT    /readers/:id       # 更新读者 [ADMIN]
DELETE /readers/:id       # 删除读者 [ADMIN]
```

#### 文件管理接口
```typescript
POST   /files/upload      # 上传文件 [ADMIN]
GET    /files/:id         # 获取文件 URL
DELETE /files/:id         # 删除文件 [ADMIN]
```

#### 统计接口
```typescript
GET    /stats/borrows     # 借阅统计 [ADMIN]
GET    /stats/books       # 图书统计 [ADMIN]
GET    /stats/popular     # 热门图书 [ADMIN]
```

### 响应格式
```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-02T12:30:16Z"
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
  "timestamp": "2025-11-02T12:30:16Z"
}
```

---

## 四、关键依赖与配置

### 核心依赖
```json
{
  "@nestjs/common": "^10.4.15",        // NestJS 核心
  "@nestjs/core": "^10.4.15",
  "@nestjs/platform-express": "^10.4.15",
  "@nestjs/config": "^3.3.0",          // 配置管理
  "@nestjs/jwt": "^10.2.0",            // JWT 认证
  "@nestjs/passport": "^10.0.3",       // Passport 集成
  "@prisma/client": "^6.2.1",          // Prisma ORM
  "bcrypt": "^5.1.1",                  // 密码加密
  "class-validator": "^0.14.1",        // DTO 校验
  "class-transformer": "^0.5.1",       // DTO 转换
  "passport-jwt": "^4.0.1",            // JWT 策略
  "passport-local": "^1.0.0"           // 本地策略
}
```

### 开发依赖
```json
{
  "@nestjs/cli": "^10.4.9",
  "@nestjs/testing": "^10.4.15",
  "jest": "^29.7.0",
  "ts-jest": "^29.2.5",
  "prisma": "^6.2.1",
  "typescript": "^5.7.2"
}
```

### NestJS 配置文件

#### `nest-cli.json`
```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

#### `tsconfig.json`
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

---

## 五、数据模型

### Prisma Schema 概览
位置: `prisma/schema.prisma`

#### 核心数据表
```prisma
// 用户与认证
model User {
  id           String    @id @default(uuid())
  username     String    @unique
  passwordHash String
  role         String    // ADMIN | READER
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

// 读者
model Reader {
  id             String   @id @default(uuid())
  userId         String   @unique
  name           String
  studentId      String?
  phone          String?
  email          String?
  status         String   @default("ACTIVE")
  maxBorrowLimit Int      @default(5)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// 图书分类
model Category {
  id        String   @id @default(uuid())
  name      String
  parentId  String?
  sort      Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 图书
model Book {
  id              String    @id @default(uuid())
  isbn            String    @unique
  title           String
  author          String
  publisher       String
  categoryId      String
  totalCopies     Int
  availableCopies Int
  coverFileId     String?
  contentFileId   String?
  description     String?   @db.Text
  publishDate     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// 借阅记录
model BorrowRecord {
  id         String    @id @default(uuid())
  bookId     String
  readerId   String
  borrowDate DateTime
  dueDate    DateTime
  returnDate DateTime?
  renewCount Int       @default(0)
  status     String    // BORROWED | RETURNED | OVERDUE
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

// 文件元数据
model FileMetadata {
  id           String   @id @default(uuid())
  originalName String
  storedName   String
  filePath     String
  fileType     String   // pdf | epub | image | other
  mimeType     String
  size         Int
  uploadedBy   String
  createdAt    DateTime @default(now())
}
```

### 数据库操作命令
```bash
# 生成 Prisma Client
pnpm prisma:generate

# 创建迁移
pnpm prisma:migrate

# 重置数据库 (开发环境)
pnpm prisma migrate reset

# 打开 Prisma Studio (可视化界面)
pnpm prisma:studio
```

---

## 六、测试与质量

### 测试配置
Jest 已配置完成，配置位于 `package.json`:
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### 测试命令
```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 测试覆盖率
pnpm test:cov

# E2E 测试
pnpm test:e2e

# 调试模式
pnpm test:debug
```

### 测试文件位置
```
src/
├── modules/
│   ├── book/
│   │   ├── domain/
│   │   │   └── entities/
│   │   │       └── book.entity.spec.ts    # 单元测试
│   │   └── presentation/
│   │       └── controllers/
│   │           └── book.controller.spec.ts  # 控制器测试
│   └── ...
└── test/
    └── app.e2e-spec.ts                    # E2E 测试
```

### 当前测试状态
- ✅ Jest 配置完成
- ⚠️ 单元测试：待编写
- ⚠️ E2E 测试：待编写
- 📊 覆盖率目标：核心领域逻辑 > 80%

---

## 七、常见问题 (FAQ)

### Q1: 如何添加新的领域模块？
```bash
# 1. 创建目录结构
src/modules/new-module/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   └── services/
├── application/
│   ├── use-cases/
│   └── dto/
├── infrastructure/
│   └── repositories/
├── presentation/
│   └── controllers/
└── new-module.module.ts

# 2. 在 app.module.ts 中导入
@Module({
  imports: [NewModuleModule],
})
export class AppModule {}
```

### Q2: 如何实现仓储模式？
```typescript
// 1. 定义接口 (domain/repositories/book.repository.ts)
export interface IBookRepository {
  save(book: Book): Promise<Book>;
  findById(id: string): Promise<Book | null>;
}

// 2. 实现仓储 (infrastructure/repositories/book.repository.ts)
@Injectable()
export class BookRepository implements IBookRepository {
  constructor(private prisma: PrismaService) {}

  async save(book: Book): Promise<Book> {
    const data = this.prisma.book.upsert({ ... });
    return this.toDomain(data);
  }
}

// 3. 注入使用 (book.module.ts)
@Module({
  providers: [
    {
      provide: 'IBookRepository',
      useClass: BookRepository,
    },
  ],
})
```

### Q3: 如何添加权限控制？
```typescript
// 1. 使用守卫
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)  // 认证 + 授权
export class BookController {
  @Post()
  @Roles(UserRole.ADMIN)  // 仅管理员
  create(@Body() dto: CreateBookDto) { ... }
}

// 2. 获取当前用户
@Get('me')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  return req.user;  // JWT 解析后的用户信息
}
```

### Q4: 如何处理文件上传？
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // file.originalname, file.buffer, file.mimetype
  const savedFile = await this.fileService.save(file);
  return savedFile;
}
```

---

## 八、相关文件清单

### 核心文件
- `src/main.ts` - 应用入口
- `src/app.module.ts` - 根模块
- `src/app.controller.ts` - 健康检查控制器
- `src/app.service.ts` - 基础服务

### 数据库文件
- `prisma/schema.prisma` - Prisma Schema 定义
- `prisma/migrations/` - 数据库迁移记录 (被 .gitignore)

### 配置文件
- `nest-cli.json` - NestJS CLI 配置
- `tsconfig.json` - TypeScript 配置
- `package.json` - 依赖与脚本
- `.env` - 环境变量 (需自行创建)

### 测试文件
- `test/jest-e2e.json` - E2E 测试配置
- `src/**/*.spec.ts` - 单元测试 (待编写)

---

## 九、下一步开发建议

### 优先级 1 (核心业务)
1. ✅ **认证模块**
   - 实现 User 实体、AuthService
   - JWT 登录/登出逻辑
   - JwtAuthGuard、RolesGuard

2. ✅ **图书模块**
   - Book 实体、Category 实体
   - BookRepository 实现
   - CRUD 用例和控制器

3. ✅ **借阅模块**
   - BorrowRecord 实体、BorrowPolicy 值对象
   - BorrowDomainService (借阅规则校验)
   - 借阅/归还/续借用例

### 优先级 2 (支撑功能)
4. ✅ **读者模块**
   - Reader 实体、ReaderRepository
   - 读者管理接口

5. ✅ **文件模块**
   - FileMetadata 实体
   - 文件上传服务 (本地存储)
   - 文件访问接口

### 优先级 3 (优化增强)
6. ⚠️ **测试覆盖**
   - 编写核心实体单元测试
   - 编写关键用例测试
   - E2E 测试 (登录、借阅流程)

7. ⚠️ **统计报表**
   - 借阅统计、图书统计
   - 热门图书排行

8. ⚠️ **性能优化**
   - 添加 Redis 缓存 (可选)
   - 数据库查询优化
   - 分页性能优化

---

**文档维护**: 本文档随模块开发持续更新
