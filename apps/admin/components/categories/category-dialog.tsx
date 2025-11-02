'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/api/category.api';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'bookCount'>) => void;
  category?: Category | null;
  categories: Category[];
}

export function CategoryDialog({
  isOpen,
  onClose,
  onSave,
  category,
  categories,
}: CategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    sort: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 当编辑模式时，填充表单数据
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        parentId: category.parentId || '',
        sort: category.sort,
      });
    } else {
      setFormData({
        name: '',
        parentId: '',
        sort: 1,
      });
    }
    setErrors({});
  }, [category, isOpen]);

  // 表单验证
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '分类名称不能为空';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '分类名称至少需要 2 个字符';
    }

    if (formData.sort < 0) {
      newErrors.sort = '排序值不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSave({
      name: formData.name.trim(),
      parentId: formData.parentId || null,
      sort: formData.sort,
    });

    onClose();
  };

  // 获取可用的父分类列表（排除自身及其子分类）
  const availableParentCategories = categories.filter(
    (cat) => cat.id !== category?.id
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 对话框内容 */}
      <div className="relative z-10 w-full max-w-md rounded-lg border bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {category ? '编辑分类' : '添加分类'}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 分类名称 */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              分类名称 <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full rounded-lg border ${
                errors.name ? 'border-destructive' : 'border-input'
              } bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
              placeholder="请输入分类名称"
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* 父分类 */}
          <div className="space-y-2">
            <label
              htmlFor="parentId"
              className="text-sm font-medium text-foreground"
            >
              父分类
            </label>
            <select
              id="parentId"
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">无（顶级分类）</option>
              {availableParentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 排序 */}
          <div className="space-y-2">
            <label
              htmlFor="sort"
              className="text-sm font-medium text-foreground"
            >
              排序值
            </label>
            <input
              id="sort"
              type="number"
              value={formData.sort}
              onChange={(e) =>
                setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
              }
              className={`w-full rounded-lg border ${
                errors.sort ? 'border-destructive' : 'border-input'
              } bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
              placeholder="数字越小越靠前"
              min="0"
            />
            {errors.sort && (
              <p className="text-xs text-destructive">{errors.sort}</p>
            )}
            <p className="text-xs text-muted-foreground">
              数值越小，显示顺序越靠前
            </p>
          </div>

          {/* 按钮组 */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              {category ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
