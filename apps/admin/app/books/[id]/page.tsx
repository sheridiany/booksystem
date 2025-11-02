'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useBook, useDeleteBook } from '@/lib/hooks';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar, Package } from 'lucide-react';
import Link from 'next/link';

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params?.id as string;

  const { data: book, isLoading, error } = useBook(bookId);
  const deleteBookMutation = useDeleteBook();

  const handleDelete = async () => {
    if (!book) return;
    if (!confirm(`确定要删除图书《${book.title}》吗?`)) return;

    try {
      await deleteBookMutation.mutateAsync(bookId);
      alert('删除成功');
      router.push('/books');
    } catch (error) {
      alert('删除失败');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">加载中...</div>
      </DashboardLayout>
    );
  }

  if (error || !book) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-destructive">
          加载失败,请检查图书ID是否正确
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/books"
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{book.title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {book.author} · {book.publisher}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/books/${bookId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
            >
              <Edit className="h-4 w-4" />
              编辑
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-destructive text-destructive rounded-md hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* 基本信息 */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">基本信息</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="ISBN" value={book.isbn} />
                <InfoItem label="书名" value={book.title} />
                <InfoItem label="作者" value={book.author} />
                <InfoItem label="出版社" value={book.publisher} />
                <InfoItem
                  label="出版日期"
                  value={
                    book.publishDate
                      ? new Date(book.publishDate).toLocaleDateString('zh-CN')
                      : '未知'
                  }
                />
                <InfoItem label="分类ID" value={book.categoryId} />
              </div>
            </div>

            {/* 图书描述 */}
            {book.description && (
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">图书描述</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-4">
            {/* 库存信息 */}
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-4 w-4" />
                库存信息
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    总库存
                  </div>
                  <div className="text-2xl font-bold">{book.totalCopies}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    可借数量
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {book.availableCopies}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    已借出
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {book.totalCopies - book.availableCopies}
                  </div>
                </div>
              </div>
            </div>

            {/* 文件信息 */}
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                文件信息
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">封面图片</span>
                  <span
                    className={
                      book.coverFileId ? 'text-green-600' : 'text-muted-foreground'
                    }
                  >
                    {book.coverFileId ? '已上传' : '未上传'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">内容文件</span>
                  <span
                    className={
                      book.contentFileId ? 'text-green-600' : 'text-muted-foreground'
                    }
                  >
                    {book.contentFileId ? '已上传' : '未上传'}
                  </span>
                </div>
              </div>
            </div>

            {/* 创建时间 */}
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                时间信息
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    创建时间
                  </div>
                  <div>{new Date(book.createdAt).toLocaleString('zh-CN')}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    更新时间
                  </div>
                  <div>{new Date(book.updatedAt).toLocaleString('zh-CN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// 信息项组件
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
