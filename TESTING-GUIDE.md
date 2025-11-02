# 众慧图书借阅系统 - 测试指引

**创建时间**: 2025-11-02
**状态**: 准备测试

---

## 📋 目录

1. [当前系统状态](#当前系统状态)
2. [必需修复项](#必需修复项)
3. [数据库初始化](#数据库初始化)
4. [后端启动](#后端启动)
5. [前端启动](#前端启动)
6. [测试流程](#测试流程)
7. [常见问题](#常见问题)

---

## 🔍 当前系统状态

### ✅ 已完成功能

#### 后端 (apps/api)
- ✅ 认证模块 (Auth Module)
  - 登录接口: `POST /api/v1/auth/login`
  - 获取用户信息: `GET /api/v1/auth/me`
  - JWT 认证守卫 (全局)
  - 角色权限守卫

- ⚠️ 图书模块 (Book Module) - **已实现但被禁用**
  - 原因: `apps/api/src/app.module.ts:14` 中被注释
  - 状态: 代码完整,需要启用

- ✅ 分类模块 (Category Module)
  - 分类 CRUD 接口

- ✅ 文件模块 (File Module)
  - 文件上传功能

#### 前端 (apps/admin)
- ✅ 登录页面 (`/login`)
  - 精美 UI 设计 (深蓝 + 金色主题)
  - 表单验证 (React Hook Form + Zod)
  - 错误提示

- ✅ 图书管理页面 (`/books`)
  - 图书列表展示
  - 搜索功能
  - 分页功能
  - 增删改查操作

- ✅ API 集成
  - Axios 客户端配置
  - JWT 自动注入
  - 统一错误处理
  - TanStack Query 数据请求

### ❌ 待修复问题

1. **数据库 Schema 不兼容**
   - 错误: `CASE types record and text cannot be matched`
   - 原因: openGauss 不支持某些 PostgreSQL 特性
   - 影响: 数据库无法初始化

2. **BookModule 被禁用**
   - 位置: `apps/api/src/app.module.ts:14-34`
   - 影响: 图书管理 API 无法访问

3. **前端环境变量缺失**
   - 缺少: `apps/admin/.env.local`
   - 影响: 前端无法连接后端 API

---

## ⚠️ 必需修复项

### 修复 1: 启用 BookModule

**操作步骤**:

```bash
# 编辑 apps/api/src/app.module.ts
```

将以下内容:
```typescript
// import { BookModule } from './modules/book/book.module';  // 临时禁用:编译错误

// 在 imports 中:
// BookModule,
```

修改为:
```typescript
import { BookModule } from './modules/book/book.module';

// 在 imports 中:
BookModule,
```

**完整修改**:
```typescript
// apps/api/src/app.module.ts

import { BookModule } from './modules/book/book.module';
import { ReaderModule } from './modules/reader/reader.module';
import { BorrowModule } from './modules/borrow/borrow.module';

@Module({
  imports: [
    // ... 其他模块
    BookModule,
    ReaderModule,
    BorrowModule,
  ],
  // ...
})
```

### 修复 2: 创建前端环境变量

**操作步骤**:

```bash
# 在 apps/admin 目录下创建 .env.local
cat > apps/admin/.env.local << 'EOF'
# API 地址
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# 文件上传地址
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
EOF
```

或手动创建文件 `apps/admin/.env.local`:
```env
# API 地址
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# 文件上传地址
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
```

### 修复 3: 数据库初始化

**⚠️ 危险操作警告**: 以下操作将重置数据库,请确认是开发环境!

**操作步骤**:

1. **确认数据库连接**:
```bash
cd apps/api
cat .env | grep DATABASE_URL
# 输出: DATABASE_URL="postgresql://gaussdb:Nibuzhid@0@127.0.0.1:15433/postgres?schema=gz_books"
```

2. **同步 Schema 到数据库** (需要用户确认):
```bash
cd apps/api
npx prisma db push
```

> **说明**: 由于 openGauss 不支持 Prisma Migrate 的 shadow database,
> 我们使用 `prisma db push` 直接同步 Schema。

3. **生成 Prisma Client**:
```bash
cd apps/api
pnpm prisma:generate
```

---

## 🗄️ 数据库初始化

### 1. 创建测试用户

**SQL 脚本** (`apps/api/prisma/seed.sql`):

```sql
-- 清空现有数据 (可选)
TRUNCATE TABLE gz_books.users CASCADE;

-- 创建管理员账户
-- 用户名: admin
-- 密码: admin123
INSERT INTO gz_books.users (id, username, password_hash, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- bcrypt(admin123)
  'ADMIN',
  true,
  NOW(),
  NOW()
);

-- 创建测试读者账户
-- 用户名: reader
-- 密码: reader123
INSERT INTO gz_books.users (id, username, password_hash, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'reader',
  '$2a$10$xHt4D5fM3gXc0PZvJ1K4YO7vYqG5X8bN9lP2wQ3rT4sU6vW7xY8zA', -- bcrypt(reader123)
  'READER',
  true,
  NOW(),
  NOW()
);

-- 创建默认分类
INSERT INTO gz_books.categories (id, name, sort, created_at, updated_at)
VALUES
  (gen_random_uuid(), '文学', 1, NOW(), NOW()),
  (gen_random_uuid(), '历史', 2, NOW(), NOW()),
  (gen_random_uuid(), '科技', 3, NOW(), NOW()),
  (gen_random_uuid(), '教育', 4, NOW(), NOW());
```

**执行方式**:

```bash
# 方式 1: 使用 psql
psql -h 127.0.0.1 -p 15433 -U gaussdb -d postgres -f apps/api/prisma/seed.sql

# 方式 2: 或直接连接执行
# (需要根据实际数据库工具操作)
```

### 2. 创建测试图书数据 (可选)

```sql
-- 获取一个分类ID
DO $$
DECLARE
  category_id UUID;
BEGIN
  SELECT id INTO category_id FROM gz_books.categories LIMIT 1;

  -- 创建测试图书
  INSERT INTO gz_books.books (id, isbn, title, author, publisher, category_id, description, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '9787020002207',
    '红楼梦',
    '曹雪芹',
    '人民文学出版社',
    category_id,
    '中国古典四大名著之首',
    NOW(),
    NOW()
  );

  -- 创建对应的纸质书载体
  INSERT INTO gz_books.book_copies (
    id,
    book_id,
    type,
    status,
    total_copies,
    available_copies,
    location,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    id,
    'PHYSICAL',
    'AVAILABLE',
    10,
    10,
    'A区-001架',
    NOW(),
    NOW()
  FROM gz_books.books
  WHERE isbn = '9787020002207';
END $$;
```

---

## 🚀 后端启动

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 2. 配置环境变量

```bash
# 检查 apps/api/.env
cat apps/api/.env

# 应该包含:
DATABASE_URL="postgresql://gaussdb:Nibuzhid@0@127.0.0.1:15433/postgres?schema=gz_books"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. 启动后端

```bash
# 方式 1: 仅启动 API
cd apps/api
pnpm dev

# 方式 2: 从根目录启动
pnpm dev:api
```

**预期输出**:
```
[Nest] 12345  - 2025/11/02 14:30:00     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 2025/11/02 14:30:00     LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] 12345  - 2025/11/02 14:30:00     LOG [InstanceLoader] AuthModule dependencies initialized
[Nest] 12345  - 2025/11/02 14:30:00     LOG [InstanceLoader] BookModule dependencies initialized
[Nest] 12345  - 2025/11/02 14:30:00     LOG [RoutesResolver] AuthController {/api/v1/auth}
[Nest] 12345  - 2025/11/02 14:30:00     LOG [RoutesResolver] BookController {/api/v1/books}
[Nest] 12345  - 2025/11/02 14:30:00     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 2025/11/02 14:30:00     LOG Application is running on: http://localhost:3000
```

### 4. 测试后端接口

```bash
# 测试健康检查
curl http://localhost:3000

# 测试登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 预期响应:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {
#       "id": "xxx",
#       "username": "admin",
#       "role": "ADMIN"
#     }
#   }
# }
```

---

## 🎨 前端启动

### 1. 安装依赖

```bash
# 如果已经在根目录安装过,可以跳过
pnpm install
```

### 2. 确认环境变量

```bash
# 检查 apps/admin/.env.local
cat apps/admin/.env.local

# 应该包含:
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
```

### 3. 启动前端

```bash
# 方式 1: 仅启动管理端
cd apps/admin
pnpm dev

# 方式 2: 从根目录启动
pnpm dev:admin
```

**预期输出**:
```
  ▲ Next.js 15.1.6
  - Local:        http://localhost:3001
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

### 4. 访问前端

打开浏览器访问: http://localhost:3001

---

## 🧪 测试流程

### 测试 1: 登录流程

**步骤**:

1. 访问登录页面: http://localhost:3001/login

2. 输入测试账号:
   - 用户名: `admin`
   - 密码: `admin123`

3. 点击"登录"按钮

**预期结果**:
- ✅ 登录成功,跳转到首页 (`/`)
- ✅ localStorage 中存储 token 和 user 信息
- ✅ 后续请求自动携带 JWT Token

**验证方式**:
```javascript
// 浏览器控制台
localStorage.getItem('token')     // 应该有 JWT token
localStorage.getItem('user')      // 应该有用户信息
```

**可能遇到的问题**:
- ❌ 401 错误: 检查用户名密码是否正确
- ❌ 网络错误: 检查后端是否启动,环境变量是否正确
- ❌ CORS 错误: 后端已配置 CORS,应该不会出现

### 测试 2: 图书列表查看

**前提**: 已完成登录

**步骤**:

1. 访问图书管理页面: http://localhost:3001/books

2. 观察页面加载状态

**预期结果**:
- ✅ 显示图书列表 (如果有数据)
- ✅ 显示"暂无图书数据"(如果无数据)
- ✅ 搜索栏可用
- ✅ "添加图书"按钮可见

**验证方式**:
```bash
# 检查后端日志,应该有 GET /api/v1/books 请求

# 检查浏览器 Network 标签
# Request URL: http://localhost:3000/api/v1/books?page=1&pageSize=10
# Request Method: GET
# Request Headers: Authorization: Bearer xxx
```

### 测试 3: 创建图书

**前提**: 已完成登录

**步骤**:

1. 点击"添加图书"按钮 → 跳转到 `/books/new`

2. 填写表单:
   - 书名: `测试图书`
   - 作者: `测试作者`
   - ISBN: `9787020002207`
   - 出版社: `测试出版社`
   - 分类: 选择一个分类
   - 库存: `10`

3. 点击"提交"

**预期结果**:
- ✅ 表单验证通过
- ✅ 成功创建图书
- ✅ 跳转回图书列表
- ✅ 列表中显示新创建的图书

**可能遇到的问题**:
- ❌ 403 错误: 权限不足 (检查 role 是否为 ADMIN)
- ❌ 400 错误: 数据验证失败 (检查表单字段)
- ❌ 500 错误: 后端错误 (检查后端日志)

### 测试 4: 搜索图书

**前提**: 已有图书数据

**步骤**:

1. 在搜索框输入关键词 (如: `测试`)

2. 按回车或点击"搜索"按钮

**预期结果**:
- ✅ 列表更新为搜索结果
- ✅ 显示匹配的图书
- ✅ 分页重置到第 1 页

### 测试 5: 编辑图书

**前提**: 已有图书数据

**步骤**:

1. 点击某本书的"编辑"图标

2. 修改某些字段 (如: 书名)

3. 点击"保存"

**预期结果**:
- ✅ 表单加载原有数据
- ✅ 成功更新图书
- ✅ 跳转回图书列表
- ✅ 列表中显示更新后的数据

### 测试 6: 删除图书

**前提**: 已有图书数据

**步骤**:

1. 点击某本书的"删除"图标

2. 在确认对话框中点击"确定"

**预期结果**:
- ✅ 显示确认对话框
- ✅ 成功删除图书
- ✅ 列表中该图书消失

---

## ❓ 常见问题

### Q1: 后端启动报错 "Cannot find module '@/shared/...'"

**原因**: TypeScript 路径别名未正确解析

**解决方案**:
```bash
# 检查 apps/api/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

# 重新构建
cd apps/api
pnpm build
```

### Q2: 前端无法连接后端 (CORS 错误)

**原因**: CORS 配置问题

**解决方案**:
```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
});
```

### Q3: 登录成功但立即跳回登录页

**原因**: JWT 验证失败或 token 未正确存储

**调试步骤**:
```javascript
// 浏览器控制台
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));

// 检查 axios 请求头
// 打开 Network 标签,查看请求是否携带 Authorization 头
```

### Q4: 图书列表一直显示"加载中..."

**可能原因**:
1. 后端未启动
2. 环境变量配置错误
3. 后端 BookModule 未启用
4. 数据库未初始化

**排查步骤**:
```bash
# 1. 检查后端状态
curl http://localhost:3000

# 2. 检查环境变量
cat apps/admin/.env.local

# 3. 检查后端路由
curl http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. 检查后端日志
# 查看 apps/api 终端输出
```

### Q5: 数据库连接失败

**错误信息**: `P1001: Can't reach database server`

**解决方案**:
```bash
# 1. 检查数据库是否运行
# (根据你的 openGauss 安装方式)

# 2. 检查连接字符串
cat apps/api/.env | grep DATABASE_URL

# 3. 测试连接
cd apps/api
npx prisma db pull
```

### Q6: Prisma Schema 同步失败

**错误信息**: `CASE types record and text cannot be matched`

**原因**: openGauss 某些特性与 PostgreSQL 不完全兼容

**临时解决方案**:
- 使用 `prisma db push` 而不是 `prisma migrate`
- 或者手动调整 Schema 中的类型定义

---

## 📝 测试检查清单

### 后端测试
- [ ] 数据库连接成功
- [ ] Prisma Schema 同步成功
- [ ] 后端启动成功 (端口 3000)
- [ ] 健康检查接口可访问 (`GET /`)
- [ ] 登录接口正常 (`POST /api/v1/auth/login`)
- [ ] JWT 认证守卫生效
- [ ] 图书列表接口正常 (`GET /api/v1/books`)

### 前端测试
- [ ] 前端启动成功 (端口 3001)
- [ ] 环境变量配置正确
- [ ] 登录页面正常显示
- [ ] 登录功能正常
- [ ] Token 正确存储
- [ ] 图书列表页面正常显示
- [ ] 图书搜索功能正常
- [ ] 图书创建功能正常
- [ ] 图书编辑功能正常
- [ ] 图书删除功能正常

### 集成测试
- [ ] 前后端通信正常
- [ ] JWT Token 自动注入
- [ ] 401 错误自动跳转登录
- [ ] API 响应格式正确
- [ ] 错误提示清晰

---

## 🎯 下一步建议

### 优先级 1 (核心功能完善)
1. 完成借阅管理模块
   - 借阅记录列表
   - 办理借阅
   - 办理归还

2. 完成读者管理模块
   - 读者列表
   - 读者 CRUD

### 优先级 2 (用户体验提升)
3. 添加首页仪表盘
   - 统计卡片
   - 快速操作入口

4. 优化图书管理
   - 文件上传功能
   - 图书详情页
   - 批量操作

### 优先级 3 (系统完善)
5. 添加统计报表
6. 添加系统配置
7. 完善权限控制
8. 添加单元测试

---

**文档维护**: 根据测试结果持续更新本文档
**最后更新**: 2025-11-02
