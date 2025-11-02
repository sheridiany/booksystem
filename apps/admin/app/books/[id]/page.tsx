'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/books';
import { bookCopiesApi } from '@/lib/api/book-copies';
import { useCategories } from '@/lib/hooks/use-categories';
import { ArrowLeft, Edit, Book as BookIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useDeleteBook } from '@/lib/hooks';
import { CopyList } from '@/components/book-copies';
import { toast } from 'sonner';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const deleteBookMutation = useDeleteBook();

  // 获取图书详情
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => booksApi.getBook(bookId),
  });

  // 获取图书载体列表
  const { data: copies, isLoading: copiesLoading, refetch: refetchCopies } = useQuery({
    queryKey: ['bookCopies', bookId],
    queryFn: () => bookCopiesApi.getBookCopies(bookId),
    enabled: !!bookId,
  });

  // 获取分类列表
  const { data: categories } = useCategories();

  // 获取分类名称
  const categoryName = categories?.find(cat => cat.id === book?.categoryId)?.name;

  // 删除图书
  const handleDelete = async () => {
    if (!book) return;
    if (!confirm(`确定要删除图书《${book.title}》吗? 这将同时删除所有载体信息。`)) return;

    try {
      await deleteBookMutation.mutateAsync(bookId);
      toast.success('图书删除成功！');
      router.push('/books');
    } catch (error) {
      toast.error('图书删除失败');
      console.error(error);
    }
  };

  if (bookLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (bookError || !book) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-destructive">图书不存在或加载失败</div>
          <button
            onClick={() => router.push('/books')}
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
          >
            返回图书列表
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center gap-3">
          <Link
            href="/books"
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{book.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              查看图书详细信息和载体列表
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/books/${bookId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Edit className="h-4 w-4" />
              编辑图书
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

        {/* 图书基本信息 */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookIcon className="h-5 w-5" />
              基本信息
            </h2>
          </div>
          <div className="p-6">
            <div className="flex gap-6">
              {/* 左侧：封面图（固定小尺寸） */}
              <div className="flex-shrink-0">
                {book.coverFileId ? (
                  <div className="w-[180px] h-[240px] rounded-lg border bg-muted overflow-hidden shadow-sm">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/files/${book.coverFileId}/download`}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[180px] h-[240px] rounded-lg border bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BookIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">暂无封面</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧：详细信息（网格布局） */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 items-start">
                  <InfoLabel>书名</InfoLabel>
                  <InfoValue className="font-semibold text-base">{book.title}</InfoValue>

                  <InfoLabel>作者</InfoLabel>
                  <InfoValue>{book.author}</InfoValue>

                  <InfoLabel>出版社</InfoLabel>
                  <InfoValue>{book.publisher}</InfoValue>

                  <InfoLabel>ISBN</InfoLabel>
                  <InfoValue mono>{book.isbn || '-'}</InfoValue>

                  <InfoLabel>分类</InfoLabel>
                  <InfoValue>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-sm border border-blue-200">
                      {categoryName || '-'}
                    </span>
                  </InfoValue>

                  <InfoLabel>出版日期</InfoLabel>
                  <InfoValue>
                    {book.publishDate ? new Date(book.publishDate).toLocaleDateString('zh-CN') : '-'}
                  </InfoValue>

                  <InfoLabel>录入时间</InfoLabel>
                  <InfoValue className="text-muted-foreground">
                    {new Date(book.createdAt).toLocaleString('zh-CN')}
                  </InfoValue>

                  {book.description && (
                    <>
                      <InfoLabel className="self-start pt-1">图书描述</InfoLabel>
                      <InfoValue className="col-span-1">
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                          {book.description}
                        </div>
                      </InfoValue>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 图书载体列表 */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookIcon className="h-5 w-5" />
              图书载体管理
              {copies && <span className="text-sm font-normal text-muted-foreground">（{copies.length} 个）</span>}
            </h2>
          </div>
          <div className="p-6">
            {copiesLoading ? (
              <div className="text-center text-muted-foreground py-8">
                加载载体信息中...
              </div>
            ) : (
              <CopyList
                bookId={bookId}
                copies={copies || []}
                onUpdate={refetchCopies}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * 信息标签组件
 */
function InfoLabel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-sm font-medium text-muted-foreground whitespace-nowrap ${className}`}>
      {children}
    </div>
  );
}

/**
 * 信息值组件
 */
function InfoValue({
  children,
  mono = false,
  className = '',
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`text-sm ${mono ? 'font-mono' : ''} ${className}`}>
      {children}
    </div>
  );
}
