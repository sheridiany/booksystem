'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, File as FileIcon } from 'lucide-react';
import { cn } from '@repo/utils';

/**
 * 文件上传组件属性
 */
export interface FileUploadProps {
  /**
   * 已上传的文件信息（用于编辑场景）
   */
  value?: {
    name: string;
    size?: number;
    url?: string;
  };

  /**
   * 上传状态改变回调
   * @param file - 选中的文件
   */
  onChange?: (file: File | null) => void;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 最大文件大小（MB），默认 50MB
   */
  maxSize?: number;

  /**
   * 允许的文件类型，默认 PDF 和 EPUB
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

  /**
   * 文件类型描述（用于提示文本）
   */
  fileTypeLabel?: string;
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 获取文件扩展名
 */
function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toUpperCase();
}

/**
 * 文件上传组件
 *
 * 功能：
 * - 拖拽上传
 * - 点击上传
 * - 文件信息展示
 * - 文件大小限制
 * - 格式验证
 * - 删除文件
 */
export function FileUpload({
  value,
  onChange,
  disabled = false,
  maxSize = 50,
  accept = ['application/pdf', 'application/epub+zip'],
  className,
  onError,
  fileTypeLabel = '电子书',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 当前文件信息（优先使用新选中的文件，其次使用传入的 value）
  const currentFile = selectedFile || (value ? { name: value.name, size: value.size } : null);

  /**
   * 验证文件
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // 验证文件类型
      if (!accept.includes(file.type)) {
        const acceptedExtensions = accept
          .map((type) => {
            if (type === 'application/pdf') return 'PDF';
            if (type === 'application/epub+zip') return 'EPUB';
            return type.split('/')[1].toUpperCase();
          })
          .join('、');
        return `不支持的文件格式。请上传 ${acceptedExtensions} 格式的文件。`;
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

      setSelectedFile(file);
      onChange?.(file);
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
   * 删除文件
   */
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      setSelectedFile(null);
      onChange?.(null);
    },
    [disabled, onChange]
  );

  /**
   * 获取文件类型描述
   */
  const getAcceptLabel = useCallback(() => {
    return accept
      .map((type) => {
        if (type === 'application/pdf') return 'PDF';
        if (type === 'application/epub+zip') return 'EPUB';
        return type.split('/')[1].toUpperCase();
      })
      .join('、');
  }, [accept]);

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
          currentFile ? 'border-transparent bg-muted' : 'border-input'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !currentFile) {
            document.getElementById('file-upload-input')?.click();
          }
        }}
      >
        {currentFile ? (
          // 文件信息展示
          <div className="flex items-center gap-3 p-3">
            {/* 文件图标 */}
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
              {getFileExtension(currentFile.name) === 'PDF' ? (
                <FileText className="h-6 w-6" />
              ) : (
                <FileIcon className="h-6 w-6" />
              )}
            </div>

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentFile.name}
              </p>
              {currentFile.size && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(currentFile.size)} · {getFileExtension(currentFile.name)}
                </p>
              )}
            </div>

            {/* 删除按钮 */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className={cn(
                  'flex-shrink-0 p-1.5 rounded-full',
                  'text-muted-foreground hover:text-destructive',
                  'hover:bg-destructive/10 transition-colors'
                )}
                aria-label="删除文件"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          // 上传提示
          <div className="flex flex-col items-center justify-center py-4 px-3">
            <div className={cn(
              'mb-2 p-2 rounded-full',
              'bg-primary/10 text-primary'
            )}>
              {isDragging ? (
                <Upload className="h-6 w-6" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
            </div>

            <div className="text-center space-y-0.5">
              <p className="text-xs font-medium">
                {isDragging ? '松开上传' : '拖拽或点击上传'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {getAcceptLabel()} · {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        id="file-upload-input"
        type="file"
        accept={accept.join(',')}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-label={`选择${fileTypeLabel}文件`}
      />
    </div>
  );
}
