# 登录页面实现文档

## 📋 概述

本文档记录了高斯图书借阅系统前端登录页面的实现,包括管理端和用户端两个独立的登录界面。

---

## 🎨 设计理念

### 管理端 (Admin)
- **风格**: 专业、严肃、高效
- **配色**: 深蓝 + 金色 (经典图书馆配色)
- **布局**: 左右分栏式 (左侧品牌展示 + 右侧登录表单)
- **特色元素**:
  - 书籍网格动画背景
  - 渐变 Logo 与标语
  - 功能特性展示
- **目标用户**: 图书管理员

### 用户端 (Reader)
- **风格**: 轻松、友好、现代
- **配色**: 渐变紫色 + 粉色 + 橙色 (活泼温暖)
- **布局**: 居中卡片式
- **特色元素**:
  - 浮动书本图标背景
  - 圆角卡片设计
  - 动态渐变按钮
  - 阅读主题图标
- **目标用户**: 普通读者

---

## 🏗️ 技术架构

### 技术栈
```yaml
框架: Next.js 15.1.6 (App Router)
表单管理: React Hook Form 7.54.2
校验: Zod 3.24.1
状态管理: Zustand 5.0.3
HTTP 客户端: Axios 1.7.9
样式: Tailwind CSS 3.4.17
```

### 目录结构
```
apps/admin/                          apps/reader/
├── app/login/page.tsx              ├── app/login/page.tsx
├── lib/                             ├── lib/
│   ├── api/                         │   ├── api/
│   │   ├── client.ts               │   │   ├── client.ts
│   │   └── auth.ts                 │   │   └── auth.ts
│   └── store/                       │   └── store/
│       └── auth-store.ts           │       └── auth-store.ts
└── .env.local                       └── .env.local
```

---

## 🔧 核心实现

### 1. API 客户端配置

**位置**: `lib/api/client.ts`

#### 功能
- 统一配置 `baseURL`
- 请求拦截器: 自动添加 JWT Token
- 响应拦截器: 401 自动清除 token 并跳转登录

#### 代码示例
```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:3000/api/v1
  timeout: 10000,
});

// 自动添加 Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 2. 认证 API

**位置**: `lib/api/auth.ts`

#### 接口定义
```typescript
export const authApi = {
  // 登录
  login: async (data: LoginDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // 获取当前用户
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
```

#### 类型定义
```typescript
interface LoginDto {
  username: string;
  password: string;
}

interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}
```

---

### 3. 状态管理 (Zustand)

**位置**: `lib/store/auth-store.ts`

#### 状态接口
```typescript
interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: UserDto) => void;
  clearAuth: () => void;
  updateUser: (user: UserDto) => void;
}
```

#### 持久化配置
```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ... state and actions
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### 使用示例
```typescript
const { user, setAuth, clearAuth, isAuthenticated } = useAuthStore();

// 登录成功后
setAuth(response.accessToken, response.user);

// 登出
clearAuth();
```

---

### 4. 登录表单

#### 表单校验 (Zod)
```typescript
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码长度至少 6 位'),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

#### React Hook Form 集成
```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

const onSubmit = async (data: LoginFormData) => {
  try {
    const response = await authApi.login(data);
    setAuth(response.accessToken, response.user);
    router.push('/');
  } catch (error) {
    setErrorMessage('登录失败');
  }
};
```

---

## 🎯 特色功能

### 管理端特色

#### 1. 左侧品牌区动画
```tsx
{/* 书籍网格动画 */}
<div className="grid grid-cols-8 grid-rows-8 h-full gap-4 p-8 rotate-12 scale-125">
  {Array.from({ length: 64 }).map((_, i) => (
    <div
      key={i}
      className="bg-white/20 rounded-sm"
      style={{
        animationDelay: `${i * 0.05}s`,
        animation: 'fadeIn 2s ease-in-out infinite alternate',
      }}
    />
  ))}
</div>
```

#### 2. 功能特性展示
```tsx
<FeatureItem
  icon="📚"
  title="智能管理"
  description="一站式图书管理平台,高效便捷"
/>
```

### 用户端特色

#### 1. 浮动书本背景
```tsx
{/* 浮动书本图标 */}
{Array.from({ length: 20 }).map((_, i) => (
  <div
    key={i}
    className="absolute text-white/10 animate-float"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 40 + 20}px`,
      animationDelay: `${Math.random() * 5}s`,
    }}
  >
    📚
  </div>
))}
```

#### 2. 渐变背景与按钮
```tsx
{/* 渐变背景 */}
<div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">

{/* 渐变按钮 */}
<button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
  开始阅读
</button>
```

---

## 🔒 安全性

### 密码处理
- ✅ 前端不存储明文密码
- ✅ 后端使用 bcrypt 加密 (apps/api)
- ✅ JWT Token 存储在 localStorage (可考虑升级为 httpOnly cookie)

### Token 管理
```typescript
// 存储
localStorage.setItem('token', token);

// 自动添加到请求头
config.headers.Authorization = `Bearer ${token}`;

// 401 自动清除
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

### XSS 防护
- ✅ Next.js 默认防护
- ✅ 用户输入通过 Zod 校验
- ✅ React 自动转义

---

## 🧪 测试账号

### 管理端 (http://localhost:3001/login)
```
用户名: admin
密码: admin123
角色: ADMIN
```

### 用户端 (http://localhost:3002/login)
```
用户名: reader
密码: reader123
角色: READER
```

### 数据库初始化
```bash
# 运行种子脚本
cd apps/api
pnpm prisma:seed

# 或重置数据库 (开发环境)
pnpm prisma migrate reset
```

---

## 📱 响应式设计

### 管理端
- **桌面端 (>= 1024px)**: 左右分栏布局
- **移动端 (< 1024px)**: 隐藏左侧品牌区,仅显示登录表单

### 用户端
- **全尺寸适配**: 居中卡片设计,自动适配屏幕宽度
- **移动端优化**: padding 调整为 `px-4`

---

## 🚀 访问地址

### 开发环境
- **管理端**: http://localhost:3001/login
- **用户端**: http://localhost:3002/login
- **后端 API**: http://localhost:3000/api/v1/auth/login

### 启动命令
```bash
# 启动所有服务
pnpm dev

# 单独启动
pnpm dev:admin   # 管理端
pnpm dev:reader  # 用户端
pnpm dev:api     # 后端
```

---

## 🔄 登录流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API
    participant D as 数据库

    U->>F: 输入用户名/密码
    F->>F: Zod 校验
    F->>A: POST /auth/login
    A->>D: 查询用户
    D-->>A: 返回用户信息
    A->>A: 验证密码 (bcrypt)
    A->>A: 生成 JWT Token
    A-->>F: 返回 Token + 用户信息
    F->>F: 保存到 Zustand + localStorage
    F->>U: 跳转到首页
```

---

## ⚙️ 环境变量

### 前端 (.env.local)
```bash
# API 地址
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# 文件上传地址
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
```

### 后端 (.env)
```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/gz-books"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# 端口
PORT=3000
```

---

## 🐛 常见问题

### Q1: 登录后提示 401?
**原因**: Token 未正确保存或后端未识别
**解决**:
1. 检查浏览器控制台,确认 `localStorage.getItem('token')` 有值
2. 检查 Network 面板,确认请求头包含 `Authorization: Bearer xxx`
3. 检查后端 JWT_SECRET 配置

### Q2: CORS 错误?
**原因**: 后端未配置 CORS
**解决**: 检查 `apps/api/src/main.ts` 中的 CORS 配置
```typescript
app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
});
```

### Q3: 表单校验不生效?
**原因**: Zod Schema 配置错误
**解决**: 检查 `loginSchema` 定义和 `zodResolver` 集成

---

## 📝 待优化项

### 功能增强
- [ ] 记住我功能 (延长 Token 有效期)
- [ ] 忘记密码流程
- [ ] 社交登录 (GitHub, Google 等)
- [ ] 验证码 (防机器人)
- [ ] 多因素认证 (2FA)

### 安全性
- [ ] Token 存储升级为 httpOnly cookie
- [ ] 刷新 Token 机制
- [ ] 登录失败次数限制
- [ ] IP 白名单 (管理端)

### 用户体验
- [ ] 登录加载动画优化
- [ ] 错误提示更友好
- [ ] 支持键盘快捷键 (Enter 提交)
- [ ] 自动聚焦用户名输入框

---

## 📚 相关文档

- [后端认证模块](../apps/api/src/modules/auth/README.md)
- [Zustand 官方文档](https://zustand-demo.pmnd.rs/)
- [React Hook Form 文档](https://react-hook-form.com/)
- [Zod 文档](https://zod.dev/)

---

**文档维护**: 本文档随登录功能迭代持续更新
**最后更新**: 2025-11-02
