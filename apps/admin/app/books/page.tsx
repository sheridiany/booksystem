'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useBooks, useDeleteBook } from '@/lib/hooks';
import { useCategories } from '@/lib/hooks/use-categories';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import type { Book } from '@repo/types';
import { toast } from 'sonner';

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // 筛选条件
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 批量选择
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());

  const pageSize = 10;

  // 获取图书列表和分类列表
  const { data, isLoading, error } = useBooks({ page, pageSize, keyword, categoryId: selectedCategory || undefined });
  const { data: categories } = useCategories();
  const deleteBookMutation = useDeleteBook();

  // 构建分类映射 (categoryId -> categoryName)
  const categoryMap = useMemo(() => {
    if (!categories) return new Map<string, string>();
    return new Map(categories.map((cat) => [cat.id, cat.name]));
  }, [categories]);

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
      toast.success('图书删除成功！');
    } catch (error) {
      toast.error('图书删除失败');
      console.error(error);
    }
  };

  // 计算总页数
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  // 全选/取消全选
  const handleToggleAll = () => {
    if (!data?.items) return;
    if (selectedBooks.size === data.items.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(data.items.map((book) => book.id)));
    }
  };

  // 切换单个选择
  const handleToggleBook = (bookId: string) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedBooks.size === 0) {
      toast.warning('请先选择要删除的图书');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedBooks.size} 本图书吗？此操作不可恢复！`)) {
      return;
    }

    try {
      // 并发删除所有选中的图书
      await Promise.all(
        Array.from(selectedBooks).map((id) => deleteBookMutation.mutateAsync(id))
      );
      toast.success('批量删除成功！');
      setSelectedBooks(new Set());
    } catch (error) {
      toast.error('部分图书删除失败，请查看控制台');
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">图书管理</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              管理图书信息、库存和文件
            </p>
          </div>
          <Link
            href="/books/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加图书
          </Link>
        </div>

        {/* 搜索栏 */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-md lg:max-w-lg">
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
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shrink-0"
          >
            搜索
          </button>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">筛选：</span>

          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">全部分类</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parentId ? `　${category.name}` : category.name}
              </option>
            ))}
          </select>

          {/* 清除筛选 */}
          {(selectedCategory) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-md hover:bg-accent transition-colors"
            >
              清除筛选
            </button>
          )}

          {/* 结果统计 */}
          {data && (
            <span className="ml-auto text-sm text-muted-foreground">
              找到 <span className="font-medium text-foreground">{data.total}</span> 本图书
            </span>
          )}
        </div>

        {/* 批量操作栏 */}
        {selectedBooks.size > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              已选择 {selectedBooks.size} 项
            </span>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 text-sm font-medium text-destructive border border-destructive rounded-md hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4 inline mr-1" />
              批量删除
            </button>
            <button
              onClick={() => setSelectedBooks(new Set())}
              className="ml-auto px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-md hover:bg-accent transition-colors"
            >
              取消选择
            </button>
          </div>
        )}

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
                    <th className="px-4 py-3 w-[40px]">
                      <input
                        type="checkbox"
                        checked={data.items.length > 0 && selectedBooks.size === data.items.length}
                        onChange={handleToggleAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-[30%] min-w-[150px]">
                      书名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-[18%] min-w-[100px]">
                      作者
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-[18%] min-w-[120px]">
                      ISBN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-[20%] min-w-[100px]">
                      出版社
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-[8%] min-w-[80px]">
                      分类
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground w-[6%] min-w-[100px]">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((book) => (
                    <BookRow
                      key={book.id}
                      book={book}
                      categoryName={categoryMap.get(book.categoryId)}
                      selected={selectedBooks.has(book.id)}
                      onToggle={handleToggleBook}
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
  categoryName,
  selected,
  onToggle,
  onDelete,
}: {
  book: Book;
  categoryName?: string;
  selected: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}) {
  return (
    <tr className={`hover:bg-muted/50 transition-colors ${selected ? 'bg-blue-50' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(book.id)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-sm">{book.title}</div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {book.author}
      </td>
      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
        {book.isbn || <span className="text-muted-foreground/50">-</span>}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {book.publisher}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {categoryName || <span className="text-muted-foreground/50">-</span>}
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
