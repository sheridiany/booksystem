[根目录](../../CLAUDE.md) > [packages](../) > **utils**

---

# packages/utils - 共享工具函数

**职责**: 提供跨应用的共享工具函数 (日期、格式化、校验等)
**包名**: `@repo/utils`
**消费者**: apps/admin, apps/reader, packages/ui

---

## 变更记录 (Changelog)

### 2025-11-02 12:30:16 - 初始化模块文档
- 创建 CLAUDE.md 文档
- 完成核心工具函数:
  - formatDate (日期格式化)
  - getDaysDiff (日期差计算)
  - formatFileSize (文件大小格式化)
  - validateISBN (ISBN 校验)
  - cn (Tailwind 类名合并)

---

## 一、模块职责

### 核心功能
1. **日期工具**
   - formatDate (日期格式化)
   - getDaysDiff (计算日期差)
   - isOverdue (判断是否逾期)
   - addDays (日期加减)

2. **格式化工具**
   - formatFileSize (文件大小格式化)
   - formatCurrency (金额格式化，可选)
   - truncateText (文本截断)

3. **校验工具**
   - validateISBN (ISBN 校验)
   - validateEmail (邮箱校验)
   - validatePhone (手机号校验)

4. **样式工具**
   - cn (Tailwind 类名合并，基于 clsx + tailwind-merge)

5. **其他工具**
   - debounce (防抖)
   - throttle (节流)
   - generateId (生成唯一 ID)

---

## 二、入口与启动

### 入口文件
- **主入口**: `index.ts`
  - 导出所有工具函数
  - 供 apps/* 和 packages/* 通过 `@repo/utils` 导入

- **cn 工具**: `cn.ts`
  - Tailwind CSS 类名合并工具
  - 被 packages/ui 大量使用

### 导出方式
```typescript
// index.ts
export * from './date';
export * from './format';
export * from './validate';
export { cn } from './cn';

// 使用
import { formatDate, cn, validateISBN } from '@repo/utils';
```

### 开发模式
本包不需要构建，TypeScript 直接引用：
```bash
# 无需独立运行，在应用中直接使用
import { formatDate } from '@repo/utils';
```

---

## 三、对外接口

### 函数导出清单

#### 日期工具
```typescript
/**
 * 日期格式化
 * @param date - 日期对象或字符串
 * @param format - 格式字符串 (默认 'YYYY-MM-DD')
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format?: string): string;

/**
 * 计算日期差 (天数)
 * @param date1 - 开始日期
 * @param date2 - 结束日期
 * @returns 天数差 (正数表示 date2 晚于 date1)
 */
export function getDaysDiff(date1: Date | string, date2: Date | string): number;
```

#### 格式化工具
```typescript
/**
 * 文件大小格式化
 * @param bytes - 字节数
 * @returns 格式化后的文件大小 (如 "1.5 MB")
 */
export function formatFileSize(bytes: number): string;
```

#### 校验工具
```typescript
/**
 * ISBN 校验
 * @param isbn - ISBN 字符串
 * @returns 是否有效
 */
export function validateISBN(isbn: string): boolean;
```

#### 样式工具
```typescript
/**
 * Tailwind CSS 类名合并
 * @param inputs - 类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string;
```

---

## 四、关键依赖与配置

### 核心依赖
```json
{
  "dependencies": {
    "clsx": "^2.1.1",              // 类名合并
    "tailwind-merge": "^2.6.0"     // Tailwind 类名冲突处理
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

### package.json 配置
```json
{
  "name": "@repo/utils",
  "version": "1.0.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": "./index.ts"
  }
}
```

---

## 五、数据模型

### 工具函数实现

#### 日期工具 (index.ts)
```typescript
/**
 * 日期格式化
 */
export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 计算日期差(天数)
 */
export function getDaysDiff(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}
```

#### 格式化工具 (index.ts)
```typescript
/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

#### 校验工具 (index.ts)
```typescript
/**
 * ISBN 校验
 */
export function validateISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');
  return /^\d{10}(\d{3})?$/.test(cleaned);
}
```

#### 样式工具 (cn.ts)
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 类名合并
 * - 自动合并冲突的 Tailwind 类名
 * - 支持条件类名、数组、对象等多种输入
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 使用示例
cn('px-4', 'px-6')                    // 结果: 'px-6' (后者覆盖前者)
cn('text-red-500', isError && 'text-blue-500')  // 条件类名
cn(['px-4', 'py-2'], 'rounded')       // 数组支持
```

---

## 六、测试与质量

### 当前状态
- ⚠️ **单元测试**: 暂未配置 (建议添加)
- ✅ **TypeScript**: 严格类型检查

### 测试建议

```typescript
// __tests__/date.test.ts

import { formatDate, getDaysDiff } from '../index';

describe('formatDate', () => {
  it('formats date with default format', () => {
    const date = new Date('2025-11-02T12:30:16');
    expect(formatDate(date)).toBe('2025-11-02');
  });

  it('formats date with custom format', () => {
    const date = new Date('2025-11-02T12:30:16');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2025-11-02 12:30:16');
  });
});

describe('getDaysDiff', () => {
  it('calculates positive diff', () => {
    const date1 = '2025-11-01';
    const date2 = '2025-11-05';
    expect(getDaysDiff(date1, date2)).toBe(4);
  });

  it('calculates negative diff', () => {
    const date1 = '2025-11-05';
    const date2 = '2025-11-01';
    expect(getDaysDiff(date1, date2)).toBe(-4);
  });
});
```

```typescript
// __tests__/format.test.ts

import { formatFileSize } from '../index';

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });
});
```

---

## 七、常见问题 (FAQ)

### Q1: 如何添加新工具函数？
```typescript
// 1. 在 index.ts 中添加函数
/**
 * 文本截断
 * @param text - 原文本
 * @param maxLength - 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// 2. 在应用中使用
import { truncateText } from '@repo/utils';

const short = truncateText('很长的文本...', 10);
```

### Q2: cn 函数如何处理 Tailwind 冲突？
```typescript
// 示例: 后者覆盖前者
cn('px-4', 'px-6')  // 结果: 'px-6'
cn('text-red-500', 'text-blue-500')  // 结果: 'text-blue-500'

// 条件类名
const isError = true;
cn('text-gray-500', isError && 'text-red-500')  // 结果: 'text-red-500'

// 复杂示例
cn(
  'px-4 py-2 bg-blue-500',
  {
    'bg-red-500': isError,
    'bg-green-500': isSuccess,
  },
  'hover:bg-blue-600'
)
// 结果: 'px-4 py-2 bg-red-500 hover:bg-blue-600' (假设 isError=true)
```

### Q3: 如何处理日期时区问题？
```typescript
// 问题: Date 对象受本地时区影响

// 方案1: 使用 ISO 字符串
export function formatDateUTC(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];  // 'YYYY-MM-DD'
}

// 方案2: 使用第三方库 (可选)
// pnpm add date-fns
import { format, parseISO } from 'date-fns';

export function formatDate(date: Date | string, formatStr = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}
```

### Q4: 如何添加防抖/节流函数？
```typescript
/**
 * 防抖函数
 * @param fn - 目标函数
 * @param delay - 延迟时间 (ms)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流函数
 * @param fn - 目标函数
 * @param delay - 间隔时间 (ms)
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn(...args);
    }
  };
}

// 使用
import { debounce } from '@repo/utils';

const handleSearch = debounce((keyword: string) => {
  console.log('搜索:', keyword);
}, 300);
```

---

## 八、相关文件清单

### 核心文件
- `index.ts` - 主入口，导出所有工具函数
- `cn.ts` - Tailwind 类名合并工具

### 配置文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置

### 未来文件结构 (可选优化)
```
packages/utils/
├── date.ts                 # 日期工具
├── format.ts               # 格式化工具
├── validate.ts             # 校验工具
├── cn.ts                   # 样式工具
├── async.ts                # 异步工具 (debounce, throttle)
├── string.ts               # 字符串工具
├── number.ts               # 数字工具
├── index.ts                # 导出所有工具
├── package.json
└── tsconfig.json
```

---

## 九、下一步开发建议

### 优先级 1 (常用工具)
1. ✅ **完善日期工具**
   - addDays / subDays (日期加减)
   - isOverdue (判断逾期)
   - formatRelativeTime (相对时间，如 "3 天前")

2. ⚠️ **添加校验工具**
   - validateEmail (邮箱校验)
   - validatePhone (手机号校验)
   - validateUrl (URL 校验)

3. ⚠️ **添加异步工具**
   - debounce (防抖)
   - throttle (节流)
   - sleep (延迟)

### 优先级 2 (扩展工具)
4. ⚠️ **字符串工具**
   - truncateText (文本截断)
   - capitalize (首字母大写)
   - slugify (转 URL 友好字符串)

5. ⚠️ **数字工具**
   - formatCurrency (金额格式化)
   - clamp (数值限制)
   - randomInt (随机整数)

### 优先级 3 (高级工具)
6. ⚠️ **对象工具**
   - deepClone (深拷贝)
   - pick / omit (对象字段筛选)
   - merge (对象合并)

7. ⚠️ **数组工具**
   - groupBy (分组)
   - unique (去重)
   - chunk (分块)

---

**文档维护**: 本文档随工具函数持续更新
