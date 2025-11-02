'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Book } from '@repo/types';
import type { CreateBookDto } from '@/lib/api/books';

/**
 * 图书表单校验 Schema
 */
const bookSchema = z.object({
  isbn: z
    .string()
    .min(10, 'ISBN至少10位')
    .regex(/^\d{10}(\d{3})?$/, 'ISBN格式错误'),
  title: z.string().min(1, '书名不能为空').max(200, '书名过长'),
  author: z.string().min(1, '作者不能为空').max(100, '作者名过长'),
  publisher: z.string().min(1, '出版社不能为空').max(100, '出版社名过长'),
  categoryId: z.string().min(1, '请选择分类'),
  totalCopies: z.number().min(1, '库存至少为1').int('库存必须为整数'),
  description: z.string().max(1000, '描述过长').optional(),
  publishDate: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormProps {
  defaultValues?: Partial<Book>;
  onSubmit: (data: CreateBookDto) => Promise<void>;
  isSubmitting?: boolean;
  submitText?: string;
}

/**
 * 图书表单组件
 *
 * 功能:
 * - 新建图书 (defaultValues 为空)
 * - 编辑图书 (传入 defaultValues)
 * - 表单校验 (React Hook Form + Zod)
 */
export function BookForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitText = '提交',
}: BookFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      isbn: defaultValues?.isbn || '',
      title: defaultValues?.title || '',
      author: defaultValues?.author || '',
      publisher: defaultValues?.publisher || '',
      categoryId: defaultValues?.categoryId || '',
      totalCopies: defaultValues?.totalCopies || 1,
      description: defaultValues?.description || '',
      publishDate: defaultValues?.publishDate
        ? new Date(defaultValues.publishDate).toISOString().split('T')[0]
        : '',
    },
  });

  const handleFormSubmit = async (data: BookFormData) => {
    await onSubmit(data as CreateBookDto);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">基本信息</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* ISBN */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              ISBN <span className="text-destructive">*</span>
            </label>
            <input
              {...register('isbn')}
              type="text"
              placeholder="9787121234567"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.isbn && (
              <p className="text-xs text-destructive mt-1">
                {errors.isbn.message}
              </p>
            )}
          </div>

          {/* 书名 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              书名 <span className="text-destructive">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="深入理解计算机系统"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 作者 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              作者 <span className="text-destructive">*</span>
            </label>
            <input
              {...register('author')}
              type="text"
              placeholder="Randal E. Bryant"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.author && (
              <p className="text-xs text-destructive mt-1">
                {errors.author.message}
              </p>
            )}
          </div>

          {/* 出版社 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              出版社 <span className="text-destructive">*</span>
            </label>
            <input
              {...register('publisher')}
              type="text"
              placeholder="机械工业出版社"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.publisher && (
              <p className="text-xs text-destructive mt-1">
                {errors.publisher.message}
              </p>
            )}
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              分类 <span className="text-destructive">*</span>
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">请选择分类</option>
              <option value="category-1">计算机科学</option>
              <option value="category-2">文学</option>
              <option value="category-3">历史</option>
              {/* TODO: 从API动态加载分类 */}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* 库存数量 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              库存数量 <span className="text-destructive">*</span>
            </label>
            <input
              {...register('totalCopies', { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="5"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.totalCopies && (
              <p className="text-xs text-destructive mt-1">
                {errors.totalCopies.message}
              </p>
            )}
          </div>

          {/* 出版日期 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              出版日期
            </label>
            <input
              {...register('publishDate')}
              type="date"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.publishDate && (
              <p className="text-xs text-destructive mt-1">
                {errors.publishDate.message}
              </p>
            )}
          </div>
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">图书描述</label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="简要介绍本书内容..."
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '提交中...' : submitText}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
