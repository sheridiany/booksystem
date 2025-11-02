# 登录功能测试指南 🧪

## 📋 测试前准备

### 1. 确保服务运行
```bash
# 在项目根目录执行
pnpm dev

# 或单独启动
pnpm dev:api     # 后端 (端口 3000)
pnpm dev:admin   # 管理端 (端口 3001)
pnpm dev:reader  # 用户端 (端口 3002)
```

### 2. 初始化数据库
```bash
cd apps/api

# 方式 1: 运行迁移 + 种子数据
pnpm prisma migrate dev
pnpm prisma:seed

# 方式 2: 完全重置 (开发环境)
pnpm prisma migrate reset  # 会自动运行 seed
```

### 3. 验证服务状态
- ✅ 后端 API: http://localhost:3000/api/v1
- ✅ 管理端: http://localhost:3001
- ✅ 用户端: http://localhost:3002

---

## 🧪 测试场景

### 场景 1: 管理端登录 (成功)

#### 步骤
1. 打开浏览器,访问 http://localhost:3001/login
2. 输入用户名: `admin`
3. 输入密码: `admin123`
4. 点击 "登录" 按钮

#### 预期结果
- ✅ 跳转到首页 `/`
- ✅ localStorage 中存在 `token` 和 `user`
- ✅ 控制台无错误

#### 验证方式
```javascript
// 打开浏览器控制台 (F12)
localStorage.getItem('token')      // 应有值: "eyJhbGciOiJIUzI1..."
localStorage.getItem('user')       // 应有值: {"id":"xxx","username":"admin","role":"ADMIN"}
JSON.parse(localStorage.getItem('auth-storage') || '{}').state.isAuthenticated  // 应为 true
```

---

### 场景 2: 用户端登录 (成功)

#### 步骤
1. 打开浏览器,访问 http://localhost:3002/login
2. 输入用户名: `reader`
3. 输入密码: `reader123`
4. 点击 "开始阅读" 按钮

#### 预期结果
- ✅ 跳转到首页 `/`
- ✅ localStorage 中存在 `token` 和 `user`
- ✅ 用户角色为 `READER`

---

### 场景 3: 错误用户名/密码

#### 步骤
1. 访问登录页
2. 输入用户名: `wronguser`
3. 输入密码: `wrongpass`
4. 点击登录

#### 预期结果
- ❌ 显示错误提示: "用户名或密码错误"
- ❌ 不跳转页面
- ❌ localStorage 无 token

---

### 场景 4: 表单校验

#### 测试用例 1: 空用户名
```
用户名: (空)
密码: admin123
预期: 显示 "请输入用户名"
```

#### 测试用例 2: 密码过短
```
用户名: admin
密码: 123
预期: 显示 "密码长度至少 6 位"
```

#### 测试用例 3: 两者皆空
```
用户名: (空)
密码: (空)
预期: 显示两个错误提示
```

---

### 场景 5: Token 自动添加

#### 步骤
1. 登录成功后,保持登录状态
2. 打开浏览器 DevTools > Network
3. 访问需要认证的接口 (如 `/api/v1/auth/me`)
4. 查看请求头

#### 预期结果
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 场景 6: 401 自动登出

#### 步骤
1. 登录成功后
2. 在浏览器控制台修改 token:
   ```javascript
   localStorage.setItem('token', 'invalid-token');
   ```
3. 刷新页面或访问需要认证的接口

#### 预期结果
- ✅ 自动清除 localStorage
- ✅ 跳转到登录页 `/login`

---

### 场景 7: 记住我功能 (TODO)

#### 步骤
1. 勾选 "记住我" 复选框
2. 登录成功
3. 关闭浏览器
4. 重新打开浏览器,访问系统

#### 预期结果 (当前未实现)
- ⏳ Token 应保持有效 (延长有效期)
- ⏳ 用户无需重新登录

---

## 🔍 调试技巧

### 1. 查看网络请求

**打开 DevTools > Network**

#### 登录请求
```
Request URL: http://localhost:3000/api/v1/auth/login
Method: POST
Status: 200 OK

Request Payload:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "xxx",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

#### 获取用户信息
```
Request URL: http://localhost:3000/api/v1/auth/me
Method: GET
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1...

Response:
{
  "id": "xxx",
  "username": "admin",
  "role": "ADMIN"
}
```

---

### 2. 查看 Zustand 状态

```javascript
// 打开浏览器控制台
const state = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('Zustand State:', state.state);

// 输出示例:
// {
//   user: { id: "xxx", username: "admin", role: "ADMIN" },
//   token: "eyJhbGciOiJIUzI1...",
//   isAuthenticated: true
// }
```

---

### 3. 查看表单校验

```javascript
// 在登录页面控制台
const form = document.querySelector('form');
console.log('Form Errors:', form);
```

---

### 4. 后端日志

```bash
# 查看后端控制台
cd apps/api
pnpm start:dev

# 登录请求日志示例:
# [AuthService] Login attempt: admin
# [AuthService] User found: xxx
# [AuthService] Password valid: true
# [AuthService] JWT generated
```

---

## 🛠️ 常见问题排查

### ❌ 登录按钮无响应

**检查项**:
1. 浏览器控制台是否有 JavaScript 错误?
2. Network 面板是否有请求发出?
3. 表单校验是否通过? (检查 errors 对象)

**解决**:
```javascript
// 控制台检查
const errors = document.querySelectorAll('[class*="text-red"]');
console.log('Form Errors:', errors);
```

---

### ❌ 提示 "用户名或密码错误" (但密码正确)

**检查项**:
1. 数据库中是否存在该用户?
2. 密码哈希是否正确?

**解决**:
```bash
# 打开 Prisma Studio
cd apps/api
pnpm prisma:studio

# 访问 http://localhost:5555
# 查看 User 表,确认用户存在且 passwordHash 不为空
```

---

### ❌ CORS 错误

**错误信息**:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/v1/auth/login'
from origin 'http://localhost:3001' has been blocked by CORS policy
```

**解决**:
```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
});
```

---

### ❌ Token 未自动添加到请求

**检查项**:
1. localStorage 中是否有 token?
2. axios 拦截器是否正确配置?

**解决**:
```javascript
// 控制台检查
console.log('Token:', localStorage.getItem('token'));

// 手动测试拦截器
import { apiClient } from '@/lib/api/client';
apiClient.get('/auth/me').then(console.log).catch(console.error);
```

---

## 📊 测试清单

### 功能测试
- [ ] 管理端登录成功
- [ ] 用户端登录成功
- [ ] 错误用户名/密码提示
- [ ] 空字段校验
- [ ] 密码长度校验
- [ ] Token 自动添加到请求头
- [ ] 401 自动清除 token 并跳转
- [ ] 登录加载状态显示
- [ ] 记住我功能 (TODO)

### UI/UX 测试
- [ ] 管理端左侧动画正常显示
- [ ] 用户端背景浮动动画正常
- [ ] 错误提示样式正确
- [ ] 按钮 hover 效果正常
- [ ] 输入框 focus 状态正确
- [ ] 移动端响应式布局

### 性能测试
- [ ] 登录请求响应时间 < 1s
- [ ] 页面加载时间 < 2s
- [ ] 动画流畅无卡顿

### 安全测试
- [ ] SQL 注入防护 (Prisma 自带)
- [ ] XSS 防护 (React 自带)
- [ ] CSRF 防护 (TODO: 添加 CSRF Token)
- [ ] 密码不在 Network 中明文传输

---

## 🚀 快速测试脚本

### 使用 curl 测试 API

```bash
# 登录请求
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 预期输出:
# {"accessToken":"eyJhbGci...","user":{"id":"xxx","username":"admin","role":"ADMIN"}}

# 获取用户信息 (需要替换 TOKEN)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 测试报告模板

```markdown
### 测试报告 - 登录功能

**测试时间**: 2025-11-02
**测试人员**: [姓名]
**测试环境**: 本地开发环境

| 测试场景 | 预期结果 | 实际结果 | 状态 | 备注 |
|---------|---------|---------|------|------|
| 管理端登录成功 | 跳转首页 | ✅ 通过 | PASS | - |
| 用户端登录成功 | 跳转首页 | ✅ 通过 | PASS | - |
| 错误密码 | 显示错误 | ✅ 通过 | PASS | - |
| 表单校验 | 显示提示 | ✅ 通过 | PASS | - |
| Token 自动添加 | 请求头包含 | ✅ 通过 | PASS | - |
| 401 自动登出 | 跳转登录 | ✅ 通过 | PASS | - |

**总结**: 核心功能正常,待优化项见文档
```

---

**文档维护**: 随测试用例增加持续更新
**最后更新**: 2025-11-02
