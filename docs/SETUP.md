# 高斯图书借阅系统 - 快速开始

## 项目结构

```
gz-books/
├── apps/
│   ├── admin/      # 管理端 (Next.js) - http://localhost:3001
│   ├── reader/     # 用户端 (Next.js) - http://localhost:3002
│   └── api/        # 后端API (NestJS) - http://localhost:3000
├── packages/
│   ├── ui/         # 共享UI组件
│   ├── types/      # 共享类型
│   └── utils/      # 共享工具
└── docs/           # 文档
```

## 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL / openGauss 数据库

## 安装步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置数据库

1. 创建数据库:
```sql
CREATE DATABASE gz_books;
```

2. 配置环境变量:
```bash
cd apps/api
cp .env.example .env
```

3. 修改 `.env` 中的数据库连接:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gz_books?schema=public"
```

### 3. 初始化数据库

```bash
cd apps/api
pnpm prisma:generate   # 生成Prisma Client
pnpm prisma:migrate    # 执行数据库迁移
```

## 开发模式

### 方式1: 启动所有应用

```bash
pnpm dev
```

启动后访问:
- 管理端: http://localhost:3001
- 用户端: http://localhost:3002
- 后端API: http://localhost:3000/api/v1

### 方式2: 独立启动

```bash
# 仅启动管理端
pnpm dev:admin

# 仅启动用户端
pnpm dev:reader

# 仅启动后端API
pnpm dev:api
```

## 生产构建

```bash
pnpm build
```

## 项目脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动所有应用 (并行) |
| `pnpm dev:admin` | 仅启动管理端 |
| `pnpm dev:reader` | 仅启动用户端 |
| `pnpm dev:api` | 仅启动后端API |
| `pnpm build` | 构建所有应用 |
| `pnpm lint` | 代码检查 |
| `pnpm format` | 代码格式化 |

## 数据库管理

```bash
cd apps/api

# 生成Prisma Client
pnpm prisma:generate

# 创建迁移
pnpm prisma:migrate

# 打开Prisma Studio (可视化管理)
pnpm prisma:studio
```

## 故障排查

### 依赖安装失败

```bash
# 清理缓存
pnpm store prune
rm -rf node_modules

# 重新安装
pnpm install
```

### 数据库连接失败

1. 检查数据库是否启动
2. 检查 `apps/api/.env` 中的 `DATABASE_URL` 配置
3. 确认数据库用户权限

### 端口被占用

修改 package.json 中的端口:
- 管理端: `apps/admin/package.json` 中的 `next dev -p 3001`
- 用户端: `apps/reader/package.json` 中的 `next dev -p 3002`
- 后端API: `apps/api/.env` 中的 `PORT=3000`

## 下一步

- 查看 [PRD.md](./PRD.md) 了解产品需求
- 查看 [DDD-ARCHITECTURE.md](./DDD-ARCHITECTURE.md) 了解架构设计
- 开始开发第一个功能模块

## 技术栈参考

- [NestJS 文档](https://docs.nestjs.com/)
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
