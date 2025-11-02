# 高斯图书借阅系统

纸质图书借阅管理平台,基于 Monorepo 架构

## 技术栈

- **架构**: Monorepo (pnpm workspace)
- **后端**: NestJS + openGauss + Prisma
- **前端**: Next.js 14 + shadcn/ui + Tailwind CSS
- **包管理**: pnpm

## 项目结构

```
gz-books/
├── apps/
│   ├── admin/      # 管理端应用
│   ├── reader/     # 用户端应用
│   └── api/        # NestJS 后端
├── packages/
│   ├── ui/         # 共享 UI 组件
│   ├── types/      # 共享类型定义
│   └── utils/      # 共享工具函数
└── docs/           # 文档
    ├── PRD.md
    └── DDD-ARCHITECTURE.md
```

## 开发指南

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- openGauss / PostgreSQL

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

```bash
# 启动所有应用
pnpm dev

# 独立启动
pnpm dev:admin   # 管理端
pnpm dev:reader  # 用户端
pnpm dev:api     # 后端 API
```

### 构建生产版本

```bash
pnpm build
```

### 代码格式化

```bash
pnpm format
```

## 设计原则

- ✅ 实用主义: 解决实际问题,拒绝过度设计
- ✅ 最简方案: 拒绝微内核、CQRS 等复杂架构
- ✅ 向后兼容: 架构演进不破坏现有功能
- ✅ DDD 实用化: 实体 + 仓储 + 服务三层足矣

## 文档

- [PRD 产品需求文档](./docs/PRD.md)
- [DDD 架构设计](./docs/DDD-ARCHITECTURE.md)

## License

MIT
