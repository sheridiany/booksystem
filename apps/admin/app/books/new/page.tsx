'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BookForm } from '@/components/books/book-form';
import { useCreateBook } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import type { CreateBookDto } from '@/lib/api/books';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBookPage() {
  const router = useRouter();
  const createBookMutation = useCreateBook();

  const handleSubmit = async (data: CreateBookDto) => {
    try {
      await createBookMutation.mutateAsync(data);
      alert('图书创建成功!');
      router.push('/books');
    } catch (error: any) {
      alert(`创建失败: ${error.response?.data?.error?.message || '未知错误'}`);
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center gap-3">
          <Link
            href="/books"
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">添加图书</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              录入新图书的基本信息
            </p>
          </div>
        </div>

        {/* 表单 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <BookForm
            onSubmit={handleSubmit}
            isSubmitting={createBookMutation.isPending}
            submitText="创建图书"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
