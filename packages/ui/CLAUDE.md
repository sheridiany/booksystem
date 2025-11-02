[根目录](../../CLAUDE.md) > [packages](../) > **ui**

---

# packages/ui - 共享 UI 组件库

**职责**: 提供跨应用的共享 UI 组件，基于 shadcn/ui + Tailwind CSS
**框架**: React 19.0.0 + Tailwind CSS 3.4.17
**包名**: `@repo/ui`
**消费者**: apps/admin, apps/reader

---

## 变更记录 (Changelog)

### 2025-11-02 12:30:16 - 初始化模块文档
- 创建 CLAUDE.md 文档
- 完成基础 Button 组件
- 配置 Tailwind CSS、class-variance-authority
- 依赖 @repo/utils (cn 工具函数)

---

## 一、模块职责

### 核心功能
1. **基础 UI 组件**
   - Button (按钮)
   - Input (输入框)
   - Select (下拉选择)
   - Checkbox (复选框)
   - Radio (单选框)
   - Table (表格)
   - Modal / Dialog (弹窗)
   - Toast / Alert (提示)
   - Card (卡片)
   - Badge (徽章)

2. **表单组件**
   - Form (表单容器)
   - FormField (表单字段)
   - FormLabel (标签)
   - FormMessage (错误提示)

3. **布局组件**
   - Container (容器)
   - Grid (网格)
   - Flex (弹性布局)

4. **业务组件** (可选)
   - BookCard (图书卡片)
   - BorrowCard (借阅卡片)
   - Pagination (分页)

### 设计原则
- **无头组件优先**: 基于 shadcn/ui 理念，组件复制到项目中可自定义
- **Tailwind CSS**: 使用 Tailwind 工具类，避免样式冲突
- **可组合性**: 组件可自由组合，保持简洁
- **类型安全**: 完整的 TypeScript 类型定义

---

## 二、入口与启动

### 入口文件
- **主入口**: `index.tsx`
  - 导出所有组件
  - 供 apps/* 通过 `@repo/ui` 导入

### 导出方式
```typescript
// index.tsx
export { Button } from './components/button';
export { Input } from './components/input';
// ... 更多组件

// 使用
import { Button, Input } from '@repo/ui';
```

### 开发模式
本包不独立运行，需在 apps 中引入使用：
```bash
# 在 apps/admin 或 apps/reader 中开发
cd apps/admin
pnpm dev

# 修改 packages/ui 中的组件会自动热重载
```

---

## 三、对外接口

### 组件导出
```typescript
// index.tsx

// 基础组件
export { Button } from './components/button';
export type { ButtonProps } from './components/button';

// 表单组件
export { Input } from './components/input';
export { Select } from './components/select';

// 布局组件
export { Card } from './components/card';

// 业务组件
export { BookCard } from './components/book-card';
```

### 组件使用示例

#### Button 组件
```typescript
import { Button } from '@repo/ui';

function MyPage() {
  return (
    <>
      <Button variant="default" size="md" onClick={() => {}}>
        默认按钮
      </Button>

      <Button variant="outline" size="sm">
        边框按钮
      </Button>

      <Button variant="ghost" size="lg" disabled>
        幽灵按钮
      </Button>
    </>
  );
}
```

---

## 四、关键依赖与配置

### 核心依赖
```json
{
  "class-variance-authority": "^0.7.1",   // 组件变体管理
  "clsx": "^2.1.1",                       // 类名合并
  "tailwind-merge": "^2.6.0",             // Tailwind 类名合并
  "tailwindcss-animate": "^1.0.7",        // 动画工具
  "@repo/utils": "workspace:*"            // cn 工具函数
}
```

### Peer 依赖
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^3.4.17"
}
```

### package.json 配置
```json
{
  "name": "@repo/ui",
  "version": "1.0.0",
  "private": true,
  "main": "./index.tsx",
  "types": "./index.tsx",
  "exports": {
    ".": "./index.tsx",
    "./components/*": "./components/*.tsx"
  }
}
```

---

## 五、关键依赖与配置

### Button 组件实现

```typescript
// components/button.tsx

import * as React from 'react';
import { cn } from '@repo/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          // 基础样式
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',

          // 变体样式
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'border border-input bg-background hover:bg-accent': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },

          // 尺寸样式
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },

          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
```

### 使用 CVA (Class Variance Authority)

```typescript
// components/button-v2.tsx (使用 CVA 优化)

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@repo/utils';

const buttonVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

---

## 六、数据模型

本包不涉及数据模型，仅提供 UI 组件。

### 组件 Props 类型
```typescript
// components/button.tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// components/input.tsx
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

// components/card.tsx
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  footer?: React.ReactNode;
}
```

---

## 七、测试与质量

### 当前状态
- ⚠️ **单元测试**: 暂未配置
- ✅ **TypeScript**: 严格类型检查
- ✅ **Tailwind CSS**: 样式工具类

### 测试建议

```typescript
// components/button.test.tsx

import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>点击</Button>);
    const button = screen.getByRole('button', { name: '点击' });
    expect(button).toHaveClass('bg-primary');
  });

  it('renders with outline variant', () => {
    render(<Button variant="outline">点击</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 八、常见问题 (FAQ)

### Q1: 如何添加新组件？
```bash
# 1. 创建组件文件
# packages/ui/components/input.tsx

import * as React from 'react';
import { cn } from '@repo/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div>
        <input
          className={cn(
            'flex h-10 w-full rounded-md border px-3 py-2',
            error && 'border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

# 2. 导出组件
# packages/ui/index.tsx
export { Input } from './components/input';
export type { InputProps } from './components/input';

# 3. 在应用中使用
import { Input } from '@repo/ui';
```

### Q2: 如何自定义组件样式？
```typescript
// 方案1: 通过 className 覆盖
<Button className="bg-red-500 hover:bg-red-600">自定义颜色</Button>

// 方案2: 扩展变体
const buttonVariants = cva('...', {
  variants: {
    variant: {
      default: '...',
      outline: '...',
      danger: 'bg-red-500 text-white hover:bg-red-600',  // 新增变体
    },
  },
});
```

### Q3: 如何处理 Tailwind CSS 冲突？
```typescript
// 使用 tailwind-merge 自动合并
import { cn } from '@repo/utils';

// cn 内部使用 twMerge，会自动处理冲突
cn('px-4', 'px-6')  // 结果: 'px-6' (后者覆盖前者)
```

### Q4: 如何在应用中配置 Tailwind 主题？
```typescript
// apps/admin/tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',  // 包含共享组件
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0070f3',
          foreground: '#ffffff',
        },
      },
    },
  },
};
```

---

## 九、相关文件清单

### 核心文件
- `index.tsx` - 主入口，导出所有组件
- `components/button.tsx` - Button 组件

### 配置文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置

### 未来文件结构 (计划)
```
packages/ui/
├── components/
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── radio.tsx
│   ├── table.tsx
│   ├── modal.tsx
│   ├── toast.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── form.tsx
│   ├── pagination.tsx
│   ├── book-card.tsx       # 业务组件
│   └── borrow-card.tsx     # 业务组件
├── index.tsx
├── package.json
└── tsconfig.json
```

---

## 十、下一步开发建议

### 优先级 1 (基础组件)
1. ✅ **Input 组件**
   - 文本输入
   - 错误提示
   - 标签

2. ✅ **Select 组件**
   - 下拉选择
   - 多选
   - 搜索

3. ✅ **Table 组件**
   - 表格展示
   - 排序
   - 分页

4. ✅ **Modal 组件**
   - 弹窗
   - 确认对话框
   - 表单弹窗

### 优先级 2 (表单组件)
5. ✅ **Form 组件**
   - 表单容器
   - 字段校验
   - 错误提示

6. ✅ **Checkbox / Radio**
   - 复选框
   - 单选框
   - 组合使用

### 优先级 3 (业务组件)
7. ⚠️ **BookCard**
   - 图书卡片
   - 封面展示
   - 库存状态

8. ⚠️ **BorrowCard**
   - 借阅记录卡片
   - 状态标识
   - 操作按钮

9. ⚠️ **Pagination**
   - 分页组件
   - 页码跳转
   - 每页数量选择

---

**文档维护**: 本文档随组件开发持续更新
