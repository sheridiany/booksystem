'use client';

import { Edit, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import type { Category } from '@/lib/api/category.api';

interface CategoryTableProps {
  categories: Category[];
  displayCategories: Category[];
  collapsedCategories: Set<string>;
  selectedCategories: string[];
  deleteConfirm: string | null;
  onToggleCollapse: (categoryId: string) => void;
  onSelectChange: (selectedKeys: string[]) => void;
  onEdit: (category: Category) => void;
  onDeleteClick: (categoryId: string) => void;
  onDeleteConfirm: (categoryId: string) => void;
  onDeleteCancel: () => void;
  getCategoryLevel: (categoryId: string) => number;
  hasChildren: (categoryId: string) => boolean;
}

export function CategoryTable({
  categories,
  displayCategories,
  collapsedCategories,
  selectedCategories,
  deleteConfirm,
  onToggleCollapse,
  onSelectChange,
  onEdit,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
  getCategoryLevel,
  hasChildren,
}: CategoryTableProps) {
  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = displayCategories.map((c) => c.id);
      onSelectChange(allKeys);
    } else {
      onSelectChange([]);
    }
  };

  // 单选
  const handleSelectRow = (key: string, checked: boolean) => {
    if (checked) {
      onSelectChange([...selectedCategories, key]);
    } else {
      onSelectChange(selectedCategories.filter((k) => k !== key));
    }
  };

  const isAllSelected =
    displayCategories.length > 0 && selectedCategories.length === displayCategories.length;
  const isIndeterminate =
    selectedCategories.length > 0 && selectedCategories.length < displayCategories.length;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {/* 批量选择列 */}
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isIndeterminate;
                    }
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                分类名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                父分类
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                图书数量
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                排序
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayCategories.map((category) => {
              const parent = categories.find((c) => c.id === category.parentId);
              const level = getCategoryLevel(category.id);
              const isTopLevel = level === 0;
              const isDeleting = deleteConfirm === category.id;
              const categoryHasChildren = hasChildren(category.id);
              const isCollapsed = collapsedCategories.has(category.id);
              const isSelected = selectedCategories.includes(category.id);

              return (
                <tr
                  key={category.id}
                  className={`hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* 批量选择列 */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(category.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>

                  {/* 分类名称 */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${level * 1.5}rem` }}
                    >
                      {/* 折叠/展开按钮 */}
                      {categoryHasChildren ? (
                        <button
                          onClick={() => onToggleCollapse(category.id)}
                          className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-accent transition-colors"
                          title={isCollapsed ? '展开' : '折叠'}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      ) : (
                        <span className="w-5" />
                      )}

                      {level > 0 && (
                        <span className="text-muted-foreground text-xs">
                          {'└' + '─'.repeat(level)}
                        </span>
                      )}
                      <FolderTree
                        className={`h-4 w-4 ${
                          isTopLevel ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                      <span className={`text-sm ${isTopLevel ? 'font-semibold' : ''}`}>
                        {category.name}
                      </span>
                      {categoryHasChildren && (
                        <span className="text-xs text-muted-foreground">
                          ({categories.filter((c) => c.parentId === category.id).length})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 父分类 */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">
                      {parent ? parent.name : '-'}
                    </span>
                  </td>

                  {/* 图书数量 */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                      {category.bookCount || 0} 本
                    </span>
                  </td>

                  {/* 排序 */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{category.sort}</span>
                  </td>

                  {/* 操作 */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    {isDeleting ? (
                      <div className="inline-flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">确定删除？</span>
                        <button
                          onClick={() => onDeleteConfirm(category.id)}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          确定
                        </button>
                        <button
                          onClick={onDeleteCancel}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onEdit(category)}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          编辑
                        </button>
                        <button
                          onClick={() => onDeleteClick(category.id)}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          删除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 空状态 */}
      {displayCategories.length === 0 && (
        <div className="text-center py-12">
          <FolderTree className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-sm font-semibold text-foreground">暂无分类</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            点击"添加分类"按钮创建第一个分类
          </p>
        </div>
      )}
    </div>
  );
}
