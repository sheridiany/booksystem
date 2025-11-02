'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@repo/utils';

/**
 * 图片上传组件属性
 */
export interface ImageUploadProps {
  /**
   * 已上传的图片 URL（用于编辑场景）
   */
  value?: string;

  /**
   * 上传状态改变回调
   * @param file - 选中的文件
   * @param preview - 预览 URL
   */
  onChange?: (file: File | null, preview: string | null) => void;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 最大文件大小（MB），默认 5MB
   */
  maxSize?: number;

  /**
   * 允许的图片格式，默认 ['image/jpeg', 'image/png', 'image/webp']
   */
  accept?: string[];

  /**
   * 自定义 className
   */
  className?: string;

  /**
   * 错误回调
   */
  onError?: (error: string) => void;
}

/**
 * 图片上传组件
 *
 * 功能：
 * - 拖拽上传
 * - 点击上传
 * - 图片预览
 * - 文件大小限制
 * - 格式验证
 * - 删除预览
 */
export function ImageUpload({
  value,
  onChange,
  disabled = false,
  maxSize = 5,
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  onError,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * 验证文件
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // 验证文件类型
      if (!accept.includes(file.type)) {
        return `不支持的文件格式。请上传 ${accept.map((t) => t.split('/')[1].toUpperCase()).join('、')} 格式的图片。`;
      }

      // 验证文件大小
      const maxBytes = maxSize * 1024 * 1024;
      if (file.size > maxBytes) {
        return `文件大小超过限制。最大允许 ${maxSize}MB，当前文件 ${(file.size / 1024 / 1024).toFixed(2)}MB。`;
      }

      return null;
    },
    [accept, maxSize]
  );

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(
    (file: File) => {
      if (disabled) return;

      // 验证文件
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        return;
      }

      // 生成预览 URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange?.(file, previewUrl);
    },
    [disabled, validateFile, onChange, onError]
  );

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * 处理文件拖放
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  /**
   * 处理文件输入改变
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
      // 重置 input value，允许重复上传同一文件
      e.target.value = '';
    },
    [handleFileSelect]
  );

  /**
   * 删除预览
   */
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      // 释放 blob URL
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }

      setPreview(null);
      onChange?.(null, null);
    },
    [disabled, preview, onChange]
  );

  return (
    <div className={cn('relative', className)}>
      {/* 上传区域 */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors',
          'hover:border-primary/50 hover:bg-accent/50',
          isDragging && 'border-primary bg-accent',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer',
          preview ? 'border-transparent' : 'border-input'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !preview) {
            document.getElementById('image-upload-input')?.click();
          }
        }}
      >
        {preview ? (
          // 预览模式 - 缩略图
          <div className="relative flex items-center gap-2 p-2 bg-muted rounded-lg">
            <img
              src={preview}
              alt="预览"
              className="h-20 w-28 object-cover rounded flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">封面图片</p>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload-input')?.click()}
                  className="text-xs text-primary hover:underline mt-0.5"
                >
                  更换
                </button>
              )}
            </div>

            {/* 删除按钮 */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className={cn(
                  'flex-shrink-0 p-1 rounded-full',
                  'text-muted-foreground hover:text-destructive',
                  'hover:bg-destructive/10 transition-colors'
                )}
                aria-label="删除图片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          // 上传提示
          <div className="flex items-center justify-center h-28 px-3">
            <div className="text-center">
              <div className={cn(
                'mx-auto mb-2 p-2 rounded-full inline-flex',
                'bg-primary/10 text-primary'
              )}>
                {isDragging ? (
                  <Upload className="h-6 w-6" />
                ) : (
                  <ImageIcon className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-medium">
                  {isDragging ? '松开上传' : '点击上传封面'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {accept.map((t) => t.split('/')[1].toUpperCase()).join('、')} · {maxSize}MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        id="image-upload-input"
        type="file"
        accept={accept.join(',')}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-label="选择图片"
      />
    </div>
  );
}
