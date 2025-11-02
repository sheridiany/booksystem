# 📱 响应式设计开发规范

> **适用范围**: gz-books 项目所有前端应用 (Admin + Reader)
> **目标平台**: 桌面端 (1024px - 1920px+)
> **更新时间**: 2025-11-02

---

## 🎯 设计原则

### 1. 桌面端优先
- **主要目标**: 优化 1366x768、1440x900、1920x1080 等桌面分辨率
- **不考虑移动端**: 手机和平板不在支持范围内
- **响应式策略**: 使用 Tailwind CSS 断点进行桌面端不同分辨率适配

### 2. 实用主义
- **优先解决实际问题**: 避免过度设计
- **性能优先**: 减少不必要的重绘和回流
- **向后兼容**: 确保现有功能在不同分辨率下正常工作

---

## 📐 Tailwind CSS 断点配置

### 自定义断点
```typescript
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',     // 小屏桌面 (基本不用)
    'md': '768px',     // 中等屏幕
    'lg': '1024px',    // 笔记本标准
    'laptop': '1366px', // 低分辨率笔记本 ⭐ 新增
    'xl': '1440px',    // 标准桌面
    '2xl': '1920px',   // 高分辨率桌面
  }
}
```

### 断点使用建议
| 断点 | 分辨率 | 使用场景 |
|------|--------|---------|
| `md:` | 768px+ | 平板/小屏桌面，用于基础响应式 |
| `lg:` | 1024px+ | 标准笔记本，主要优化点 |
| `laptop:` | 1366px+ | 低分辨率笔记本专用 ⭐ |
| `xl:` | 1440px+ | 标准桌面，提升体验 |
| `2xl:` | 1920px+ | 高分辨率桌面，锦上添花 |

---

## 🛠️ 常见响应式模式

### 模式 1: 容器内边距

#### ❌ 错误示例
```tsx
<main className="px-4 py-5">
  {/* 所有分辨率使用固定内边距 */}
</main>
```

#### ✅ 正确示例
```tsx
<main className="px-6 lg:px-8 py-6 lg:py-8">
  {/* 1024px 以下: 24px 左右边距
      1024px 以上: 32px 左右边距 */}
</main>
```

#### 应用场景
- 主容器 (`<main>`)
- 卡片容器 (`<div className="rounded-lg border p-4 sm:p-6">`)
- 对话框/模态框

---

### 模式 2: 表格单元格内边距

#### ❌ 错误示例
```tsx
<th className="px-6 py-3">书名</th>
<td className="px-6 py-4">《三体》</td>
```
**问题**: `px-6` (24px) 在低分辨率下占用过多空间

#### ✅ 正确示例
```tsx
<th className="px-4 py-3">书名</th>
<td className="px-4 py-4">《三体》</td>
```
**改进**: `px-4` (16px) 节省约 33% 水平空间

#### 应用场景
- 所有数据表格 (`<table>`)
- 表格组件 (`DataTable`, `CategoryTable`)

---

### 模式 3: 网格布局

#### ❌ 错误示例
```tsx
<div className="grid grid-cols-4">
  {/* 所有分辨率都是 4列，低分辨率会挤压 */}
</div>
```

#### ✅ 正确示例 (统计卡片)
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* <640px: 单列
      640-1024px: 2列
      1024-1440px: 3列
      1440px+: 4列 */}
</div>
```

#### ✅ 正确示例 (表单)
```tsx
<div className="grid gap-x-6 gap-y-4 lg:grid-cols-2">
  {/* <1024px: 单列 (避免输入框过窄)
      1024px+: 双列 */}
</div>
```

#### 应用场景
- 统计卡片网格
- 表单字段网格
- 图书卡片网格

---

### 模式 4: Flex 布局换行

#### ❌ 错误示例
```tsx
<div className="flex items-center justify-between">
  <h1>图书管理</h1>
  <button>添加图书</button>
  {/* 窄屏下标题和按钮会挤在一行 */}
</div>
```

#### ✅ 正确示例
```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <h1>图书管理</h1>
  <button>添加图书</button>
  {/* <768px: 垂直排列
      768px+: 水平排列 */}
</div>
```

#### 应用场景
- 页面标题 + 操作按钮
- 搜索栏 + 筛选按钮
- 批量操作栏

---

### 模式 5: 响应式宽度限制

#### ❌ 错误示例
```tsx
<div className="max-w-md">
  {/* 固定最大宽度 448px，在大屏幕上留白过多 */}
</div>
```

#### ✅ 正确示例 (搜索框)
```tsx
<div className="flex-1 sm:max-w-md lg:max-w-lg">
  {/* <640px: 充满容器
      640-1024px: 最大 448px
      1024px+: 最大 512px */}
</div>
```

#### ✅ 正确示例 (主容器)
```tsx
<main className="mx-auto max-w-7xl">
  {/* 所有分辨率最大 1280px，
      在 1366px 下左右各留 43px 呼吸空间 */}
</main>
```

#### 应用场景
- 主内容区容器
- 搜索输入框
- 对话框/模态框

---

### 模式 6: 表格列宽比例

#### ❌ 错误示例
```tsx
<th>书名</th>
<th>作者</th>
<th>ISBN</th>
{/* 列宽平均分配，重要信息显示不全 */}
```

#### ✅ 正确示例
```tsx
<th className="w-[30%] min-w-[150px]">书名</th>
<th className="w-[20%] min-w-[100px]">作者</th>
<th className="w-[18%] min-w-[120px]">ISBN</th>
<th className="w-[18%] min-w-[100px]">出版社</th>
<th className="w-[8%] min-w-[60px]">库存</th>
<th className="w-[6%] min-w-[100px] text-right">操作</th>
```

#### 应用场景
- 所有数据表格
- 重要信息优先分配宽度

---

### 模式 7: 导航栏响应式

#### ❌ 错误示例
```tsx
<nav className="flex items-center gap-1">
  <span className="hidden sm:inline-block">众慧图书管理系统</span>
  {/* 系统名称在 640px 以上显示，1366px 下仍占用大量空间 */}
</nav>
```

#### ✅ 正确示例
```tsx
<div className="flex items-center gap-2.5 mr-4 lg:mr-6">
  <div className="h-7 w-7">Logo</div>
  <span className="hidden lg:inline-block">众慧图书管理系统</span>
  {/* 1024px 以下隐藏系统名称，释放约 120px 空间 */}
</div>

<nav className="flex items-center gap-0.5 lg:gap-1">
  <Link className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm">
    {/* 1024px 以下: 8px 内边距, 12px 字体
        1024px 以上: 12px 内边距, 14px 字体 */}
  </Link>
</nav>
```

#### 应用场景
- 顶部导航栏
- Logo 和系统名称
- 导航菜单项

---

### 模式 8: 按钮响应式

#### ❌ 错误示例
```tsx
<button className="px-4 py-2">搜索</button>
{/* 窄屏下按钮宽度不够，点击区域小 */}
```

#### ✅ 正确示例
```tsx
<button className="w-full sm:w-auto px-4 py-2 shrink-0">
  搜索
  {/* <640px: 全宽按钮
      640px+: 自动宽度 */}
</button>
```

#### 应用场景
- 搜索按钮
- 表单提交按钮
- 操作按钮

---

## 🚫 避免事项清单

### 1. 固定像素值
```tsx
// ❌ 不推荐
<div className="w-[800px] h-[600px]">
<div style={{ paddingLeft: '48px' }}>

// ✅ 推荐
<div className="w-full max-w-4xl h-screen">
<div className="pl-6 lg:pl-12">
```

### 2. 缺乏响应式断点
```tsx
// ❌ 不推荐
<div className="grid-cols-4">  // 固定 4列

// ✅ 推荐
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

### 3. Flex 不换行
```tsx
// ❌ 不推荐
<div className="flex gap-2">  // 窄屏会挤压

// ✅ 推荐
<div className="flex flex-col sm:flex-row gap-2">
<div className="flex flex-wrap gap-2">
```

### 4. 过大的内边距/间距
```tsx
// ❌ 不推荐
<th className="px-8 py-5">  // 表格内边距过大

// ✅ 推荐
<th className="px-4 py-3">
```

### 5. 忽略 max-width
```tsx
// ❌ 不推荐
<main className="px-4">  // 在大屏幕上内容会过宽

// ✅ 推荐
<main className="mx-auto max-w-7xl px-4">
```

---

## 📋 开发检查清单

### 新建页面/组件时
- [ ] 主容器是否设置 `max-w-*` 限制
- [ ] 内边距是否使用响应式断点 (`px-6 lg:px-8`)
- [ ] 网格布局是否定义响应式列数
- [ ] Flex 布局是否考虑换行场景
- [ ] 按钮是否在窄屏下全宽显示

### 修改表格时
- [ ] 单元格内边距是否为 `px-4` (而非 `px-6`)
- [ ] 是否为关键列设置宽度比例 (`w-[30%]`)
- [ ] 是否设置 `min-w-*` 防止过度压缩
- [ ] 操作列是否固定宽度

### 修改表单时
- [ ] 是否使用 `lg:grid-cols-2` (而非 `md:grid-cols-2`)
- [ ] gap 是否区分横向和纵向 (`gap-x-6 gap-y-4`)
- [ ] 输入框是否在窄屏下全宽显示

### 代码 Review 时
- [ ] 是否存在固定像素值 (`w-[800px]`)
- [ ] 是否存在过大的内边距 (`px-8`, `py-10`)
- [ ] 是否缺少响应式断点
- [ ] 是否考虑 1366px 分辨率的显示效果

---

## 🧪 测试验证

### 测试分辨率
在 Chrome DevTools 中测试以下分辨率：
- **1366x768** (低分辨率笔记本) ⭐ 重点测试
- **1440x900** (MacBook Air)
- **1536x864** (Windows 笔记本)
- **1920x1080** (标准桌面)

### 测试步骤
1. 打开 Chrome DevTools (F12)
2. 切换到设备模拟器 (Ctrl+Shift+M / Cmd+Shift+M)
3. 选择 "Responsive" 模式
4. 手动输入测试分辨率
5. 检查以下内容：
   - [ ] 主内容区是否有合适的左右边距
   - [ ] 表格内容是否显示完整
   - [ ] 导航栏是否清爽不拥挤
   - [ ] 按钮、表单是否易于操作
   - [ ] 整体视觉密度是否合理

---

## 📚 参考资源

### Tailwind CSS 官方文档
- [响应式设计](https://tailwindcss.com/docs/responsive-design)
- [自定义断点](https://tailwindcss.com/docs/breakpoints)
- [容器配置](https://tailwindcss.com/docs/container)

### 项目相关文档
- [根目录 CLAUDE.md](../CLAUDE.md) - 项目整体架构
- [Admin CLAUDE.md](../apps/admin/CLAUDE.md) - 管理端说明
- [PRD.md](./PRD.md) - 产品需求文档

---

## ✨ 最佳实践示例

### 完整页面示例
```tsx
// apps/admin/app/books/page.tsx (优化后)

export default function BooksPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 页面标题: 响应式 flex 布局 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">图书管理</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              管理图书信息、库存和文件
            </p>
          </div>
          <Link
            href="/books/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加图书
          </Link>
        </div>

        {/* 搜索栏: 响应式宽度 */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-md lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索书名、作者、ISBN..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shrink-0">
            搜索
          </button>
        </div>

        {/* 表格: 列宽比例 */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left w-[30%] min-w-[150px]">书名</th>
                <th className="px-4 py-3 text-left w-[20%] min-w-[100px]">作者</th>
                <th className="px-4 py-3 text-left w-[18%] min-w-[120px]">ISBN</th>
                <th className="px-4 py-3 text-left w-[18%] min-w-[100px]">出版社</th>
                <th className="px-4 py-3 text-left w-[8%] min-w-[60px]">库存</th>
                <th className="px-4 py-3 text-right w-[6%] min-w-[100px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* ... */}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

**文档维护**: 本规范随项目开发持续更新，如有新的响应式模式，请及时补充。
