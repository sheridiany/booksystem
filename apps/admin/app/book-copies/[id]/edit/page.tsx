'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { bookCopiesApi } from '@/lib/api/book-copies';
import { booksApi } from '@/lib/api/books';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import type { BookCopyStatus } from '@repo/types';
import type { UpdateBookCopyDto } from '@/lib/api/book-copies';
import { FileUpload } from '@/components/ui/file-upload';

/**
 * 纸质书编辑 Schema
 */
const physicalCopySchema = z.object({
  totalCopies: z.number().min(1, '库存至少为 1').int('必须是整数'),
  location: z.string().max(100, '存储位置过长').optional(),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE']),
});

/**
 * 电子书编辑 Schema
 */
const ebookCopySchema = z.object({
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE']),
});

type PhysicalFormData = z.infer<typeof physicalCopySchema>;
type EbookFormData = z.infer<typeof ebookCopySchema>;

export default function EditBookCopyPage() {
  const params = useParams();
  const router = useRouter();
  const copyId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);

  // 获取载体详情
  const { data: copy, isLoading: copyLoading } = useQuery({
    queryKey: ['bookCopy', copyId],
    queryFn: () => bookCopiesApi.getBookCopy(copyId),
  });

  // 获取关联的图书信息
  const { data: book } = useQuery({
    queryKey: ['book', copy?.bookId],
    queryFn: () => booksApi.getBook(copy!.bookId),
    enabled: !!copy?.bookId,
  });

  const isPhysical = copy?.type === 'PHYSICAL';
  const schema = isPhysical ? physicalCopySchema : ebookCopySchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isPhysical
      ? {
          totalCopies: copy?.totalCopies || 1,
          location: copy?.location || '',
          status: copy?.status || 'AVAILABLE',
        }
      : {
          status: copy?.status || 'AVAILABLE',
        },
  });

  /**
   * 处理表单提交
   */
  const onSubmit = async (data: PhysicalFormData | EbookFormData) => {
    if (!copy) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const updateData: UpdateBookCopyDto = {
        status: data.status as BookCopyStatus,
      };

      // 纸质书额外字段
      if (isPhysical && 'totalCopies' in data) {
        // 验证：总库存不能少于已借出数量
        const borrowedCount = (copy.totalCopies || 0) - (copy.availableCopies || 0);
        if (data.totalCopies < borrowedCount) {
          setError(`总库存(${data.totalCopies})不能少于已借出数量(${borrowedCount})`);
          setIsSubmitting(false);
          return;
        }

        updateData.totalCopies = data.totalCopies;
        updateData.location = data.location || undefined;
      }

      // 电子书重新上传文件（可选功能）
      if (!isPhysical && ebookFile) {
        try {
          const fileId = await booksApi.uploadContent(copy.bookId, ebookFile);
          updateData.fileId = fileId;
          updateData.fileSize = ebookFile.size;
        } catch (err) {
          console.error('文件上传失败:', err);
          setError('电子书文件上传失败，请检查文件格式和大小');
          setIsSubmitting(false);
          return;
        }
      }

      await bookCopiesApi.updateBookCopy(copyId, updateData);
      alert('更新成功！');
      router.push(`/books/${copy.bookId}/edit`);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || '更新失败');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (copyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!copy) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-destructive">载体不存在或加载失败</div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
          >
            返回
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/books" className="hover:text-foreground transition-colors">
            图书列表
          </Link>
          <span>/</span>
          {book && (
            <>
              <Link
                href={`/books/${book.id}/edit`}
                className="hover:text-foreground transition-colors"
              >
                {book.title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">编辑载体</span>
        </div>

        {/* 页面标题 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              编辑{isPhysical ? '纸质书' : '电子书'}载体
            </h1>
            {book && (
              <p className="text-muted-foreground text-sm mt-1">
                所属图书：《{book.title}》 - {book.author}
              </p>
            )}
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/50">
            <h2 className="text-lg font-semibold">载体信息</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* 错误提示 */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* 电子书提示 */}
            {!isPhysical && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-sm">
                💡 电子书可以重新上传文件以替换现有版本，也可以仅修改状态。
              </div>
            )}

            {/* 纸质书字段 */}
            {isPhysical && (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      总库存数量 <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register('totalCopies', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.totalCopies && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.totalCopies.message as string}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1.5">
                      当前可借数量: {copy.availableCopies || 0} 本 | 已借出:{' '}
                      {(copy.totalCopies || 0) - (copy.availableCopies || 0)} 本
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">存储位置</label>
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="例如：A区-001架"
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.location && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.location.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 电子书字段 */}
            {!isPhysical && (
              <div className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">电子书格式</label>
                    <input
                      type="text"
                      value={copy.ebookFormat?.toUpperCase() || '-'}
                      disabled
                      className="w-full px-3 py-2 text-sm border rounded-md bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">格式不可修改</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">文件大小</label>
                    <input
                      type="text"
                      value={
                        copy.fileSize
                          ? `${(copy.fileSize / (1024 * 1024)).toFixed(2)} MB`
                          : '-'
                      }
                      disabled
                      className="w-full px-3 py-2 text-sm border rounded-md bg-muted cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* 重新上传文件（可选） */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    重新上传电子书文件（可选）
                  </label>
                  <FileUpload
                    onChange={(file) => setEbookFile(file)}
                    onError={(err) => setError(err)}
                    accept={['application/pdf', 'application/epub+zip']}
                    maxSize={50}
                    fileTypeLabel="电子书"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    上传新文件将替换现有电子书，留空则保持不变
                  </p>
                </div>
              </div>
            )}

            {/* 状态字段（通用） */}
            <div>
              <label className="block text-sm font-medium mb-2">
                状态 <span className="text-destructive">*</span>
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="AVAILABLE">可用</option>
                <option value="UNAVAILABLE">不可用</option>
                <option value="MAINTENANCE">维护中</option>
              </select>
              {errors.status && (
                <p className="text-xs text-destructive mt-1">
                  {errors.status.message as string}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                设置为"不可用"或"维护中"后，该载体将无法借阅
              </p>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? '保存中...' : '保存修改'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
