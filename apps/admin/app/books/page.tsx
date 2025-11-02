'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useBooks, useDeleteBook } from '@/lib/hooks';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import type { Book } from '@repo/types';

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const pageSize = 10;

  // 获取图书列表
  const { data, isLoading, error } = useBooks({ page, pageSize, keyword });
  const deleteBookMutation = useDeleteBook();

  // 搜索处理
  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1); // 重置到第一页
  };

  // 删除图书
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除图书《${title}》吗?`)) return;

    try {
      await deleteBookMutation.mutateAsync(id);
      alert('删除成功');
    } catch (error) {
      alert('删除失败');
      console.error(error);
    }
  };

  // 计算总页数
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">图书管理</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              管理图书信息、库存和文件
            </p>
          </div>
          <Link
            href="/books/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加图书
          </Link>
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索书名、作者、ISBN..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            搜索
          </button>
        </div>

        {/* 图书表格 */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              加载失败,请稍后重试
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              暂无图书数据
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      书名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      作者
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      ISBN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      出版社
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      库存
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((book) => (
                    <BookRow
                      key={book.id}
                      book={book}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {data.total} 条记录,第 {page}/{totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// 图书表格行组件
function BookRow({
  book,
  onDelete,
}: {
  book: Book;
  onDelete: (id: string, title: string) => void;
}) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-sm">{book.title}</div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {book.author}
      </td>
      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
        {book.isbn}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {book.publisher}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <span className="font-medium">{book.availableCopies}</span>
          <span className="text-muted-foreground">
            {' '}
            / {book.totalCopies}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/books/${book.id}`}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="查看详情"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/books/${book.id}/edit`}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="编辑"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(book.id, book.title)}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
