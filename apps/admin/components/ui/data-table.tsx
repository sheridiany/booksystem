'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  title: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: any, record: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (record: T) => string;
  onRow?: (record: T) => {
    onClick?: () => void;
    className?: string;
  };
  loading?: boolean;
  emptyText?: string;
  emptyIcon?: ReactNode;
  selectedRowKeys?: string[];
  onSelectChange?: (selectedKeys: string[]) => void;
  rowSelection?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRow,
  loading = false,
  emptyText = '暂无数据',
  emptyIcon,
  selectedRowKeys = [],
  onSelectChange,
  rowSelection = false,
}: DataTableProps<T>) {
  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = data.map(rowKey);
      onSelectChange?.(allKeys);
    } else {
      onSelectChange?.([]);
    }
  };

  // 单选
  const handleSelectRow = (key: string, checked: boolean) => {
    if (checked) {
      onSelectChange?.([...selectedRowKeys, key]);
    } else {
      onSelectChange?.(selectedRowKeys.filter((k) => k !== key));
    }
  };

  const isAllSelected = data.length > 0 && selectedRowKeys.length === data.length;
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {/* 批量选择列 */}
              {rowSelection && (
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
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((record, index) => {
              const key = rowKey(record);
              const isSelected = selectedRowKeys.includes(key);
              const rowProps = onRow?.(record) || {};

              return (
                <tr
                  key={key}
                  onClick={rowProps.onClick}
                  className={`hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  } ${rowProps.className || ''}`}
                >
                  {/* 批量选择列 */}
                  {rowSelection && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(key, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                  )}

                  {columns.map((column) => {
                    const value = record[column.key];
                    const content = column.render
                      ? column.render(value, record, index)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-4 whitespace-nowrap ${
                          column.align === 'center'
                            ? 'text-center'
                            : column.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 空状态 */}
      {data.length === 0 && !loading && (
        <div className="text-center py-12">
          {emptyIcon}
          <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
        </div>
      )}
    </div>
  );
}
