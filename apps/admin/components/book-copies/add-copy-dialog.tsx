'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { BookCopyType, EbookFormat } from '@repo/types';
import type { CreateBookCopyDto } from '@/lib/api/book-copies';
import { bookCopiesApi } from '@/lib/api/book-copies';
import { booksApi } from '@/lib/api/books';
import { FileUpload } from '@/components/ui/file-upload';

/**
 * 组件属性
 */
interface AddCopyDialogProps {
  bookId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 表单验证 Schema
 */
const addCopySchema = z.object({
  type: z.enum(['PHYSICAL', 'EBOOK']),
  // 纸质书字段
  totalCopies: z.number().int('必须是整数').optional(),
  location: z.string().max(100, '存储位置过长').optional(),
  // 电子书字段
  ebookFormat: z.enum(['pdf', 'epub', 'mobi']).optional(),
});

type AddCopyFormData = z.infer<typeof addCopySchema>;

/**
 * 添加载体对话框
 *
 * 功能：
 * - 选择载体类型（纸质书/电子书）
 * - 纸质书：填写库存数量、存储位置
 * - 电子书：上传文件、选择格式
 */
export function AddCopyDialog({ bookId, onClose, onSuccess }: AddCopyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddCopyFormData>({
    resolver: zodResolver(addCopySchema),
    defaultValues: {
      type: 'PHYSICAL',
      totalCopies: 1,
      location: '',
      ebookFormat: 'pdf',
    },
  });

  const copyType = watch('type');

  /**
   * 处理电子书文件选择
   */
  const handleEbookChange = useCallback((file: File | null) => {
    setEbookFile(file);
    setUploadError(null);

    // 自动推断格式
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf' || extension === 'epub' || extension === 'mobi') {
        setValue('ebookFormat', extension as EbookFormat);
      }
    }
  }, [setValue]);

  /**
   * 提交表单
   */
  const onSubmit = async (data: AddCopyFormData) => {
    try {
      setIsSubmitting(true);
      setUploadError(null);

      const copyData: CreateBookCopyDto = {
        bookId,
        type: data.type as BookCopyType,
      };

      // 纸质书
      if (data.type === 'PHYSICAL') {
        if (!data.totalCopies || data.totalCopies < 1) {
          setUploadError('纸质书库存数量至少为 1');
          setIsSubmitting(false);
          return;
        }
        copyData.totalCopies = data.totalCopies;
        copyData.location = data.location || undefined;
      }
      // 电子书
      else {
        if (!ebookFile) {
          setUploadError('请上传电子书文件');
          setIsSubmitting(false);
          return;
        }
        if (!data.ebookFormat) {
          setUploadError('请选择电子书格式');
          setIsSubmitting(false);
          return;
        }

        // 上传文件
        try {
          const fileId = await booksApi.uploadContent(bookId, ebookFile);
          copyData.fileId = fileId;
          copyData.ebookFormat = data.ebookFormat as EbookFormat;
          copyData.fileSize = ebookFile.size;
        } catch (error) {
          console.error('文件上传失败:', error);
          throw new Error('电子书文件上传失败，请检查文件格式和大小');
        }
      }

      // 创建载体
      await bookCopiesApi.createBookCopy(copyData);
      alert('载体创建成功!');
      onSuccess();
    } catch (error: any) {
      setUploadError(error.message || error.response?.data?.error?.message || '操作失败');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* 对话框标题 */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background">
          <h2 className="text-lg font-semibold">添加新载体</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* 显示错误信息 */}
          {uploadError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {uploadError}
            </div>
          )}

          {/* 载体类型选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              载体类型 <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('type')}
                  type="radio"
                  value="PHYSICAL"
                  className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm font-medium">纸质书</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('type')}
                  type="radio"
                  value="EBOOK"
                  className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm font-medium">电子书</span>
              </label>
            </div>
          </div>

          {/* 条件字段 */}
          {copyType === 'PHYSICAL' ? (
            <>
              {/* 纸质书字段 */}
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
                  <p className="text-xs text-destructive mt-1">{errors.totalCopies.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">存储位置</label>
                <input
                  {...register('location')}
                  type="text"
                  placeholder="例如：A区-001架"
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.location && (
                  <p className="text-xs text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 电子书字段 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  电子书格式 <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('ebookFormat')}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pdf">PDF</option>
                  <option value="epub">EPUB</option>
                  <option value="mobi">MOBI</option>
                </select>
                {errors.ebookFormat && (
                  <p className="text-xs text-destructive mt-1">{errors.ebookFormat.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  电子书文件 <span className="text-destructive">*</span>
                </label>
                <FileUpload
                  onChange={handleEbookChange}
                  onError={(error) => setUploadError(error)}
                  accept={['application/pdf', 'application/epub+zip']}
                  maxSize={50}
                  fileTypeLabel="电子书"
                />
              </div>
            </>
          )}

          {/* 按钮组 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? '创建中...' : '创建载体'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
