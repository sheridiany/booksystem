'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BookForm } from '@/components/books/book-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CreateBookDto } from '@/lib/api/books';
import type { CreateBookCopyDto } from '@/lib/api/book-copies';
import { booksApi } from '@/lib/api/books';
import { bookCopiesApi } from '@/lib/api/book-copies';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewBookPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 处理表单提交
   *
   * 流程:
   * 1. 创建图书基本信息 (Book)
   * 2. 上传封面图片 (如果有)
   * 3. 上传电子书文件 (如果是电子书)
   * 4. 创建图书载体 (BookCopy)
   */
  const handleSubmit = async (
    bookData: CreateBookDto,
    copyData: CreateBookCopyDto,
    files: { cover?: File; ebook?: File }
  ) => {
    try {
      setIsSubmitting(true);

      // 1. 创建图书基本信息
      const createdBook = await booksApi.createBook(bookData);
      console.log('图书创建成功:', createdBook);

      // 2. 上传封面图片 (如果有)
      // 注意: uploadCover 接口内部已自动更新图书的 coverFileId，无需再次调用 updateBook
      if (files.cover) {
        try {
          await booksApi.uploadCover(createdBook.id, files.cover);
          console.log('封面上传成功');
        } catch (error) {
          console.error('封面上传失败:', error);
          // 封面上传失败不阻断流程，继续创建
        }
      }

      // 3. 上传电子书文件 (如果是电子书)
      if (copyData.type === 'EBOOK' && files.ebook) {
        try {
          const contentFileId = await booksApi.uploadContent(createdBook.id, files.ebook);
          copyData.fileId = contentFileId;
          console.log('电子书文件上传成功:', contentFileId);
        } catch (error) {
          console.error('电子书文件上传失败:', error);
          throw new Error('电子书文件上传失败，请检查文件格式和大小');
        }
      }

      // 4. 创建图书载体
      copyData.bookId = createdBook.id;
      await bookCopiesApi.createBookCopy(copyData);

      toast.success('图书创建成功！');
      router.push('/books');
    } catch (error: any) {
      toast.error(`创建失败: ${error.response?.data?.error?.message || error.message || '未知错误'}`);
      console.error('图书创建失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* 页面标题 */}
        <div className="flex items-center gap-2">
          <Link
            href="/books"
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">添加图书</h1>
            <p className="text-muted-foreground text-xs">
              录入新图书的基本信息
            </p>
          </div>
        </div>

        {/* 表单 */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <BookForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="创建图书"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
