根据对项目的深度分析,我为您制定了清晰的开发计划。以下是核心发现和建议:

  📊 当前项目状态总结

  ✅ 已完成 (80%)

  - 基础架构: Monorepo + Next.js + NestJS 脚手架完整
  - 数据库设计: Prisma Schema 完整定义所有表
  - 认证模块: 登录界面精美、后端基础框架搭建完成
  - 共享包: 类型定义完整、基础工具函数可用

  ⚠️ 关键缺失 (20%)

  1. 数据库未初始化 - Prisma 迁移未运行,无种子数据
  2. 认证未完善 - 缺少守卫 (JwtAuthGuard)、装饰器、密码加密
  3. 业务模块为 0 - 图书、借阅、读者、文件模块均未实现

  ---
  🎯 推荐开发路线

  基于 DDD 架构 和 实用主义原则,我建议按以下顺序开发:

  🚀 第一阶段: 基础设施修复 (2-3 天)

  目标: 让认证功能完全可用

  核心任务:
  1. ✅ 创建 apps/api/src/shared/ 共享模块
    - guards/jwt-auth.guard.ts - JWT 守卫
    - decorators/public.decorator.ts - 公开接口装饰器
    - decorators/current-user.decorator.ts - 获取当前用户
    - guards/roles.guard.ts - 角色权限守卫
    - filters/http-exception.filter.ts - 全局异常处理
  2. ✅ 完善 User 实体业务逻辑
    - 密码加密 (bcrypt)
    - 密码验证方法
    - 实体工厂方法
  3. ✅ 数据库初始化
    - 运行 Prisma 迁移: pnpm prisma migrate dev
    - 创建种子数据: 初始管理员 admin/admin123 + 测试读者
  4. ✅ 配置全局中间件
    - ValidationPipe (自动验证 DTO)
    - 全局异常过滤器
    - 统一 API 响应格式

  完成标准:
  - ✅ 前端登录成功获取 JWT Token
  - ✅ 受保护的接口需要 Token 才能访问
  - ✅ 角色权限控制生效 (Admin vs Reader)

  ---
  📚 第二阶段: 图书管理模块 (4-5 天)

  目标: 管理员可以完成图书 CRUD

  DDD 分层开发顺序:

  1. 领域层 (Day 1-2)
    - Book 实体 - 包含 borrow() / returnBook() 业务逻辑
    - Category 实体 - 图书分类
    - IBookRepository 接口定义
  2. 基础设施层 (Day 2-3)
    - BookRepository 实现 - Prisma 数据访问
    - CategoryRepository 实现
  3. 应用层 (Day 3-4)
    - CreateBookUseCase - 创建图书
    - ListBooksUseCase - 图书列表 (分页、搜索)
    - UpdateBookUseCase - 更新图书
    - DeleteBookUseCase - 删除图书
    - DTO 定义 (CreateBookDto, UpdateBookDto, BookDto)
  4. 表现层 (Day 4)
    - BookController - RESTful 接口
    - API 端点: GET/POST/PUT/DELETE /api/v1/books
  5. 前端页面 (Day 5)
    - apps/admin/app/(dashboard)/books/page.tsx - 图书列表
    - apps/admin/app/(dashboard)/books/new/page.tsx - 新增图书
    - apps/admin/app/(dashboard)/books/[id]/edit/page.tsx - 编辑图书
    - API 封装 + TanStack Query 集成

  完成标准:
  - ✅ 管理端可以增删改查图书
  - ✅ 支持分页和搜索
  - ✅ 数据验证生效 (ISBN 格式、必填字段)

  ---
  📁 第三阶段: 文件管理模块 (2-3 天)

  目标: 支持 PDF/EPUB 文件上传

  核心实现:
  1. 文件上传服务 (FileUploadService)
    - 文件类型校验 (仅 PDF/EPUB)
    - 文件大小限制 (如 50MB)
    - 本地存储到 /uploads 目录
    - 元数据入库 (file_metadata 表)
  2. 文件接口
    - POST /api/v1/files/upload - 上传文件
    - GET /api/v1/files/:id - 获取文件流
  3. 前端集成
    - 图书表单中添加文件上传组件
    - 拖拽上传 + 进度显示

  完成标准:
  - ✅ 创建图书时可上传 PDF/EPUB
  - ✅ 文件存储到服务器,路径保存到数据库

  ---
  📖 第四阶段: 借阅管理模块 (4-5 天)

  目标: 完整的借阅流程

  核心实现:
  1. 领域服务 (BorrowDomainService)
    - 借阅规则校验 (库存、借阅上限、读者状态)
    - 逾期检测逻辑
    - 应还日期计算
  2. 用例编排
    - BorrowBookUseCase - 借书 (减库存 + 创建记录)
    - ReturnBookUseCase - 还书 (加库存 + 更新记录)
    - RenewBorrowUseCase - 续借 (延长应还日期)
    - ListBorrowsUseCase - 借阅记录查询
  3. 前端页面
    - 管理端: 借阅管理 (借书、还书、催还)
    - 用户端: 我的借阅 (当前借阅、历史记录)

  完成标准:
  - ✅ 管理员可以为读者办理借还书
  - ✅ 读者可以查看自己的借阅记录
  - ✅ 逾期状态自动计算

  ---
  👤 第五阶段: 读者管理模块 (2-3 天)

  目标: 读者信息 CRUD

  实现要点:
  - Reader 实体 + 仓储
  - 简单的 CRUD 接口 (无复杂业务逻辑)
  - 前端读者管理页面

  完成标准:
  - ✅ 管理员可以管理读者信息
  - ✅ 可设置借阅上限、启用/停用读者

  ---
  🎨 第六阶段: 用户端核心功能 (4-5 天)

  目标: 读者可以检索图书、在线预览

  核心页面:
  1. 图书检索页 - 搜索、筛选、分页
  2. 图书详情页 - 显示封面、简介、借阅按钮
  3. PDF 阅读器 - 使用 react-pdf
  4. EPUB 阅读器 - 使用 react-reader
  5. 我的借阅 - 当前借阅 + 历史记录

  技术要点:
  // PDF 阅读器
  import { Document, Page } from 'react-pdf';

  // EPUB 阅读器
  import { ReactReader } from 'react-reader';

  完成标准:
  - ✅ 读者可以检索图书
  - ✅ 可以在线预览 PDF/EPUB
  - ✅ 可以查看借阅记录

  ---
  📈 开发时间线

  Week 1: 阶段 1 (基础设施) + 阶段 2 (图书管理) 开始
  Week 2: 阶段 2 (图书管理) 完成 + 阶段 3 (文件管理)
  Week 3: 阶段 4 (借阅管理) + 阶段 5 (读者管理)
  Week 4: 阶段 6 (用户端功能)

  ---
  🎯 我的建议

  根据分析,我建议 立即开始第一阶段 (基础设施修复),因为:

  1. ✅ 无依赖: 可以立即开始
  2. 🔐 阻塞性: 认证不完善会阻碍所有后续开发
  3. ⚡ 快速见效: 2-3 天就能让登录功能完全可用

  第一阶段的核心任务:
  - 创建 JwtAuthGuard 和装饰器
  - 完善 User 实体密码加密
  - 运行数据库迁移 + 种子数据
  - 配置全局异常处理