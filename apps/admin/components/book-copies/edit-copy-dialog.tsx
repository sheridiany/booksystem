'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { BookCopy, BookCopyStatus } from '@repo/types';
import type { UpdateBookCopyDto } from '@/lib/api/book-copies';
import { bookCopiesApi } from '@/lib/api/book-copies';

/**
 * 组件属性
 */
interface EditCopyDialogProps {
  copy: BookCopy;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 纸质书编辑 Schema
 */
const physicalCopySchema = z.object({
  totalCopies: z.number().min(1, '库存至少为 1').int('必须是整数'),
  location: z.string().max(100, '存储位置过长').optional(),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE']),
});

/**
 * 电子书编辑 Schema（仅状态）
 */
const ebookCopySchema = z.object({
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE']),
});

type PhysicalCopyFormData = z.infer<typeof physicalCopySchema>;
type EbookCopyFormData = z.infer<typeof ebookCopySchema>;

/**
 * 编辑载体对话框
 *
 * 功能：
 * - 纸质书：编辑库存、位置、状态
 * - 电子书：仅编辑状态（不支持文件替换）
 */
export function EditCopyDialog({ copy, onClose, onSuccess }: EditCopyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPhysical = copy.type === 'PHYSICAL';

  // 根据类型选择不同的 Schema
  const schema = isPhysical ? physicalCopySchema : ebookCopySchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isPhysical
      ? {
          totalCopies: copy.totalCopies || 1,
          location: copy.location || '',
          status: copy.status,
        }
      : {
          status: copy.status,
        },
  });

  // 当 copy 变化时重置表单
  useEffect(() => {
    reset(
      isPhysical
        ? {
            totalCopies: copy.totalCopies || 1,
            location: copy.location || '',
            status: copy.status,
          }
        : {
            status: copy.status,
          }
    );
  }, [copy, isPhysical, reset]);

  /**
   * 提交表单
   */
  const onSubmit = async (data: PhysicalCopyFormData | EbookCopyFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const updateData: UpdateBookCopyDto = {
        status: data.status as BookCopyStatus,
      };

      // 纸质书额外字段
      if (isPhysical && 'totalCopies' in data) {
        updateData.totalCopies = data.totalCopies;
        updateData.location = data.location || undefined;
      }

      await bookCopiesApi.updateBookCopy(copy.id, updateData);
      alert('更新成功!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || '更新失败');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* 对话框标题 */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background">
          <h2 className="text-lg font-semibold">
            编辑{isPhysical ? '纸质书' : '电子书'}载体
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* 电子书提示 */}
          {!isPhysical && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-sm">
              💡 电子书载体暂不支持文件替换，仅可修改状态。
            </div>
          )}

          {/* 纸质书字段 */}
          {isPhysical && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">
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
                <p className="text-xs text-muted-foreground mt-1">
                  当前可借数量: {copy.availableCopies || 0} 本
                </p>
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
                  <p className="text-xs text-destructive mt-1">
                    {errors.location.message as string}
                  </p>
                )}
              </div>
            </>
          )}

          {/* 状态字段（通用） */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
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
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? '保存中...' : '保存修改'}
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
