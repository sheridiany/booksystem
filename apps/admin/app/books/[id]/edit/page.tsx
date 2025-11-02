'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BookForm } from '@/components/books/book-form';
import { useBook, useUpdateBook } from '@/lib/hooks';
import { useRouter, useParams } from 'next/navigation';
import type { CreateBookDto } from '@/lib/api/books';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params?.id as string;

  const { data: book, isLoading, error } = useBook(bookId);
  const updateBookMutation = useUpdateBook();

  const handleSubmit = async (data: CreateBookDto) => {
    try {
      await updateBookMutation.mutateAsync({ id: bookId, data });
      alert('图书更新成功!');
      router.push(`/books/${bookId}`);
    } catch (error: any) {
      alert(`更新失败: ${error.response?.data?.error?.message || '未知错误'}`);
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
        <div className="flex items-center gap-3">
          <Link
            href={`/books/${bookId}`}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">编辑图书</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              修改图书 《{book.title}》 的信息
            </p>
          </div>
        </div>

        {/* 表单 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <BookForm
            defaultValues={book}
            onSubmit={handleSubmit}
            isSubmitting={updateBookMutation.isPending}
            submitText="保存更改"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
