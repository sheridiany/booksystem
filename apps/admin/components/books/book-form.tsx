'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback, useEffect } from 'react';
import type { Book, BookCopyType, EbookFormat } from '@repo/types';
import type { CreateBookDto } from '@/lib/api/books';
import type { CreateBookCopyDto } from '@/lib/api/book-copies';
import { ImageUpload } from '@/components/ui/image-upload';
import { FileUpload } from '@/components/ui/file-upload';
import { useCategories } from '@/lib/hooks/use-categories';

/**
 * 图书表单校验 Schema
 */
const bookSchema = z.object({
  // 图书基本信息
  isbn: z
    .string()
    .regex(/^\d{10}(\d{3})?$/, 'ISBN格式错误')
    .optional()
    .or(z.literal('')),
  title: z.string().min(1, '书名不能为空').max(200, '书名过长'),
  author: z.string().min(1, '作者不能为空').max(100, '作者名过长'),
  publisher: z.string().min(1, '出版社不能为空').max(100, '出版社名过长'),
  categoryId: z.string().min(1, '请选择分类'),
  description: z.string().max(1000, '描述过长').optional(),
  publishDate: z.string().optional(),

  // 图书载体类型
  copyType: z.enum(['PHYSICAL', 'EBOOK'], {
    required_error: '请选择图书类型',
  }),

  // 纸质书字段 (type=PHYSICAL 时必填)
  totalCopies: z.number().int('库存必须为整数').optional(),
  location: z.string().max(100, '存放位置过长').optional(),

  // 电子书字段 (type=EBOOK 时必填)
  ebookFormat: z.enum(['pdf', 'epub', 'mobi']).optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormProps {
  defaultValues?: Partial<Book>;
  onSubmit: (
    bookData: CreateBookDto,
    copyData: CreateBookCopyDto,
    files: { cover?: File; ebook?: File }
  ) => Promise<void>;
  isSubmitting?: boolean;
  submitText?: string;
}

/**
 * 图书表单组件 (完全重构版)
 *
 * 功能:
 * - 支持纸质书和电子书
 * - 封面图片上传 (拖拽/点击)
 * - 电子书文件上传 (PDF/EPUB)
 * - 条件字段显示 (根据图书类型)
 * - 表单校验 (React Hook Form + Zod)
 *
 * 架构说明:
 * - Book: 图书元信息 (标题、作者、出版社等)
 * - BookCopy: 图书载体 (纸质书库存或电子书文件)
 */
export function BookForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitText = '提交',
}: BookFormProps) {
  // 获取分类列表
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // 表单状态
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      isbn: defaultValues?.isbn || '',
      title: defaultValues?.title || '',
      author: defaultValues?.author || '',
      publisher: defaultValues?.publisher || '',
      categoryId: defaultValues?.categoryId || '',
      description: defaultValues?.description || '',
      publishDate: defaultValues?.publishDate
        ? new Date(defaultValues.publishDate).toISOString().split('T')[0]
        : '',
      copyType: 'PHYSICAL',
      totalCopies: 1,
      location: '',
      ebookFormat: 'pdf',
    },
  });

  // 监听图书类型
  const copyType = watch('copyType');

  // 文件上传状态
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * 处理封面图片改变
   */
  const handleCoverChange = useCallback((file: File | null, preview: string | null) => {
    setCoverFile(file);
    setCoverPreview(preview);
    setUploadError(null);
  }, []);

  /**
   * 处理电子书文件改变
   */
  const handleEbookChange = useCallback((file: File | null) => {
    setEbookFile(file);
    setUploadError(null);

    // 自动识别格式
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf' || extension === 'epub' || extension === 'mobi') {
        setValue('ebookFormat', extension as EbookFormat);
      }
    }
  }, [setValue]);

  /**
   * 处理上传错误
   */
  const handleUploadError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  /**
   * 表单提交
   */
  const handleFormSubmit = async (data: BookFormData) => {
    try {
      setUploadError(null);

      // 1. 准备图书基本信息
      const bookData: CreateBookDto = {
        isbn: data.isbn || undefined,
        title: data.title,
        author: data.author,
        publisher: data.publisher,
        categoryId: data.categoryId,
        description: data.description || undefined,
        publishDate: data.publishDate || undefined,
        // coverFileId 将在上传后设置
      };

      // 2. 准备图书载体信息
      const copyData: CreateBookCopyDto = {
        bookId: '', // 将在创建图书后设置
        type: data.copyType as BookCopyType,
      };

      // 3. 根据类型添加特定字段
      if (data.copyType === 'PHYSICAL') {
        // 纸质书
        if (!data.totalCopies || data.totalCopies < 1) {
          setUploadError('纸质书库存不能为空且必须大于0');
          return;
        }
        copyData.totalCopies = data.totalCopies;
        copyData.location = data.location || undefined;
      } else {
        // 电子书
        if (!ebookFile) {
          setUploadError('请上传电子书文件');
          return;
        }
        if (!data.ebookFormat) {
          setUploadError('请选择电子书格式');
          return;
        }
        copyData.ebookFormat = data.ebookFormat as EbookFormat;
        copyData.fileSize = ebookFile.size;
        // fileId 将在上传后设置
      }

      // 4. 调用父组件的提交处理（传递文件）
      await onSubmit(bookData, copyData, {
        cover: coverFile || undefined,
        ebook: ebookFile || undefined,
      });
    } catch (error: any) {
      setUploadError(error.message || '提交失败，请重试');
    }
  };

  /**
   * 当图书类型改变时，清除相关错误
   */
  useEffect(() => {
    setUploadError(null);
  }, [copyType]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2.5">
      {/* 全局错误提示 */}
      {uploadError && (
        <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {uploadError}
        </div>
      )}

      {/* 图书类型选择 */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-70">图书类型</h3>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              {...register('copyType')}
              type="radio"
              value="PHYSICAL"
              className="w-3.5 h-3.5 text-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs font-medium">纸质图书</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              {...register('copyType')}
              type="radio"
              value="EBOOK"
              className="w-3.5 h-3.5 text-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs font-medium">电子图书</span>
          </label>
        </div>
        {errors.copyType && (
          <p className="text-xs text-destructive">{errors.copyType.message}</p>
        )}
      </div>

      {/* 基本信息 */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-70">基本信息</h3>

        <div className="grid gap-x-3 gap-y-2 lg:grid-cols-3">
          {/* 书名 */}
          <div>
            <label className="block text-sm font-medium mb-0.5">
              书名 <span className="text-destructive">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="深入理解计算机系统"
              className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-0.5">{errors.title.message}</p>
            )}
          </div>

          {/* 作者 */}
          <div>
            <label className="block text-sm font-medium mb-0.5">
              作者 <span className="text-destructive">*</span>
            </label>
            <input
              {...register('author')}
              type="text"
              placeholder="Randal E. Bryant"
              className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.author && (
              <p className="text-xs text-destructive mt-0.5">{errors.author.message}</p>
            )}
          </div>

          {/* ISBN (可选) */}
          <div>
            <label className="block text-sm font-medium mb-0.5">
              ISBN <span className="text-muted-foreground text-[10px]">(可选)</span>
            </label>
            <input
              {...register('isbn')}
              type="text"
              placeholder="9787121234567"
              className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.isbn && (
              <p className="text-xs text-destructive mt-0.5">{errors.isbn.message}</p>
            )}
          </div>

          {/* 出版社 */}
          <div>
            <label className="block text-sm font-medium mb-0.5">
              出版社 <span className="text-destructive">*</span>
            </label>
            <input
              {...register('publisher')}
              type="text"
              placeholder="机械工业出版社"
              className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.publisher && (
              <p className="text-xs text-destructive mt-0.5">{errors.publisher.message}</p>
            )}
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium mb-0.5">
              分类 <span className="text-destructive">*</span>
            </label>
            <select
              {...register('categoryId')}
              disabled={categoriesLoading}
              className="w-full px-2.5 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {categoriesLoading ? '加载中...' : '请选择分类'}
              </option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.parentId ? `　${category.name}` : category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive mt-0.5">{errors.categoryId.message}</p>
            )}
          </div>

          {/* 出版日期 */}
          <div>
            <label className="block text-sm font-medium mb-0.5">出版日期</label>
            <input
              {...register('publishDate')}
              type="month"
              className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.publishDate && (
              <p className="text-xs text-destructive mt-0.5">{errors.publishDate.message}</p>
            )}
          </div>
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-xs font-medium mb-0.5">图书描述</label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="简要介绍本书内容..."
            className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-0.5">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* 载体信息 (根据类型显示不同字段) */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-70">载体信息</h3>

        {copyType === 'PHYSICAL' ? (
          // 纸质书字段
          <div className="grid gap-x-3 gap-y-2 lg:grid-cols-2">
            {/* 库存数量 */}
            <div>
              <label className="block text-sm font-medium mb-0.5">
                库存数量 <span className="text-destructive">*</span>
              </label>
              <input
                {...register('totalCopies', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="5"
                className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.totalCopies && (
                <p className="text-xs text-destructive mt-0.5">{errors.totalCopies.message}</p>
              )}
            </div>

            {/* 存放位置 */}
            <div>
              <label className="block text-sm font-medium mb-0.5">
                存放位置 <span className="text-muted-foreground text-[10px]">(可选)</span>
              </label>
              <input
                {...register('location')}
                type="text"
                placeholder="A区-001架"
                className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.location && (
                <p className="text-xs text-destructive mt-0.5">{errors.location.message}</p>
              )}
            </div>
          </div>
        ) : (
          // 电子书字段 - 横向布局
          <div className="grid gap-x-3 gap-y-2 lg:grid-cols-2 lg:items-end">
            {/* 左侧:格式+文件 */}
            <div className="space-y-2">
              {/* 电子书格式 */}
              <div>
                <label className="block text-sm font-medium mb-0.5">
                  电子书格式 <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('ebookFormat')}
                  className="w-full px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="pdf">PDF</option>
                  <option value="epub">EPUB</option>
                  <option value="mobi">MOBI</option>
                </select>
                {errors.ebookFormat && (
                  <p className="text-xs text-destructive mt-0.5">{errors.ebookFormat.message}</p>
                )}
              </div>

              {/* 电子书文件上传 */}
              <div>
                <label className="block text-sm font-medium mb-0.5">
                  电子书文件 <span className="text-destructive">*</span>
                </label>
                <FileUpload
                  onChange={handleEbookChange}
                  onError={handleUploadError}
                  accept={['application/pdf', 'application/epub+zip']}
                  maxSize={50}
                  fileTypeLabel="电子书"
                />
              </div>
            </div>

            {/* 右侧:封面 */}
            <div>
              <label className="block text-sm font-medium mb-0.5">封面图片</label>
              <ImageUpload
                value={defaultValues?.coverFileId}
                onChange={handleCoverChange}
                onError={handleUploadError}
                maxSize={5}
              />
            </div>
          </div>
        )}
      </div>

      {/* 封面图片 (仅纸质书显示) */}
      {copyType === 'PHYSICAL' && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">封面图片</h3>
          <div className="max-w-xs">
            <ImageUpload
              value={defaultValues?.coverFileId}
              onChange={handleCoverChange}
              onError={handleUploadError}
              maxSize={5}
            />
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="flex gap-2 pt-2 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '提交中...' : submitText}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="px-3 py-1 text-xs font-medium border rounded hover:bg-accent transition-colors disabled:opacity-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}
