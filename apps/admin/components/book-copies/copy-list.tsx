'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Book, HardDrive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BookCopy } from '@repo/types';
import { bookCopiesApi } from '@/lib/api/book-copies';
import { AddCopyDialog } from './add-copy-dialog';

/**
 * 组件属性
 */
interface CopyListProps {
  bookId: string;
  copies: BookCopy[];
  onUpdate: () => void;
}

/**
 * 图书载体列表组件
 *
 * 功能：
 * - 展示所有载体（纸质书/电子书）
 * - 提供编辑、删除操作
 * - 显示载体详细信息
 */
export function CopyList({ bookId, copies, onUpdate }: CopyListProps) {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);

  /**
   * 删除载体
   */
  const handleDelete = async (copy: BookCopy) => {
    const typeName = copy.type === 'PHYSICAL' ? '纸质书' : '电子书';
    if (!confirm(`确定要删除这个${typeName}载体吗？此操作不可恢复！`)) {
      return;
    }

    try {
      await bookCopiesApi.deleteBookCopy(copy.id);
      alert('删除成功');
      onUpdate();
    } catch (error: any) {
      alert(`删除失败: ${error.response?.data?.error?.message || error.message || '未知错误'}`);
      console.error(error);
    }
  };

  /**
   * 跳转到载体编辑页面
   */
  const handleEdit = (copyId: string) => {
    router.push(`/book-copies/${copyId}/edit`);
  };

  /**
   * 处理添加成功
   */
  const handleAddSuccess = () => {
    setShowAddDialog(false);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {/* 添加按钮 */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          添加载体
        </button>
      </div>

      {/* 载体列表 */}
      {copies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">暂无载体信息</p>
          <p className="text-xs mt-1">点击上方按钮添加纸质书或电子书载体</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {copies.map((copy) => (
            <CopyCard
              key={copy.id}
              copy={copy}
              onEdit={() => handleEdit(copy.id)}
              onDelete={() => handleDelete(copy)}
            />
          ))}
        </div>
      )}

      {/* 添加对话框 */}
      {showAddDialog && (
        <AddCopyDialog
          bookId={bookId}
          onClose={() => setShowAddDialog(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}

/**
 * 载体卡片组件
 */
function CopyCard({
  copy,
  onEdit,
  onDelete,
}: {
  copy: BookCopy;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isPhysical = copy.type === 'PHYSICAL';

  /**
   * 获取状态标签样式
   */
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      AVAILABLE: {
        label: '可用',
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      UNAVAILABLE: {
        label: '不可用',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      MAINTENANCE: {
        label: '维护中',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
    };

    const config = statusMap[status] || statusMap.UNAVAILABLE;
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded border ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
      {/* 头部：类型图标 + 状态 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isPhysical ? (
            <Book className="h-5 w-5 text-blue-600" />
          ) : (
            <HardDrive className="h-5 w-5 text-purple-600" />
          )}
          <span className="font-semibold text-sm">
            {isPhysical ? '纸质书' : '电子书'}
          </span>
        </div>
        {getStatusBadge(copy.status)}
      </div>

      {/* 内容：载体详情 */}
      <div className="space-y-2 text-sm">
        {isPhysical ? (
          <>
            {/* 纸质书信息 */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">总库存:</span>
              <span className="font-medium">{copy.totalCopies || 0} 本</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">可借数量:</span>
              <span className="font-medium">{copy.availableCopies || 0} 本</span>
            </div>
            {copy.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">存储位置:</span>
                <span className="font-medium">{copy.location}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 电子书信息 */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">格式:</span>
              <span className="font-medium uppercase">{copy.ebookFormat}</span>
            </div>
            {copy.fileSize && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">文件大小:</span>
                <span className="font-medium">{formatFileSize(copy.fileSize)}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              文件 ID: {copy.fileId?.substring(0, 8)}...
            </div>
          </>
        )}
      </div>

      {/* 底部：操作按钮 */}
      <div className="flex gap-2 mt-4 pt-3 border-t">
        <button
          onClick={onEdit}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-accent transition-colors"
        >
          <Edit className="h-3.5 w-3.5" />
          编辑
        </button>
        <button
          onClick={onDelete}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-destructive text-destructive rounded-md hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          删除
        </button>
      </div>
    </div>
  );
}
