'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { booksApi } from '@/lib/api/books';
import { bookCopiesApi } from '@/lib/api/book-copies';
import { ArrowLeft, Book, Image as ImageIcon, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/lib/hooks/use-categories';
import type { CreateBookDto } from '@/lib/api/books';
import { ImageUpload } from '@/components/ui/image-upload';
import { CopyList } from '@/components/book-copies/copy-list';
import { toast } from 'sonner';

/**
 * 图书编辑表单校验 Schema (仅元信息)
 */
const editBookSchema = z.object({
  isbn: z
    .string()
    .regex(/^\d{10}(\d{3})?$/, 'ISBN格式错误')
    .optional()
    .or(z.literal('')),
  title: z.string().min(1, '书名不能为空').max(200, '书名过长'),
  author: z.string().min(1, '作者不能为空').max(100, '作者名过长'),
  publisher: z.string().min(1, '出版社不能为空').max(100, '出版社名过长'),
  categoryId: z.string().min(1, '请选择分类'),
  description: z.string().max(1000, '描述过长').optional(),
  publishDate: z.string().optional(),
});

type EditBookFormData = z.infer<typeof editBookSchema>;

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'cover' | 'copies'>('info');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 获取图书详情
  const { data: book, isLoading, error } = useQuery({
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
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // 表单
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBookFormData>({
    resolver: zodResolver(editBookSchema),
    values: book
      ? {
          isbn: book.isbn || '',
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          categoryId: book.categoryId,
          description: book.description || '',
          publishDate: book.publishDate
            ? new Date(book.publishDate).toISOString().split('T')[0]
            : '',
        }
      : undefined,
  });

  /**
   * 提交表单（基本信息）
   */
  const onSubmit = async (data: EditBookFormData) => {
    try {
      setIsSubmitting(true);
      setUploadError(null);

      const updateData: Partial<CreateBookDto> = {
        isbn: data.isbn || undefined,
        title: data.title,
        author: data.author,
        publisher: data.publisher,
        categoryId: data.categoryId,
        description: data.description || undefined,
        publishDate: data.publishDate || undefined,
      };

      // 如果有新封面文件，先上传
      if (coverFile) {
        try {
          const coverFileId = await booksApi.uploadCover(bookId, coverFile);
          updateData.coverFileId = coverFileId;
        } catch (err) {
          console.error('封面上传失败:', err);
          setUploadError('封面上传失败，将仅保存其他信息');
        }
      }

      await booksApi.updateBook(bookId, updateData);

      // 刷新缓存
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });

      toast.success('图书信息更新成功！');
      router.push(`/books/${bookId}`);
    } catch (error: any) {
      toast.error(`更新失败: ${error.response?.data?.error?.message || error.message || '未知错误'}`);
      console.error('图书更新失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 单独上传封面
   */
  const handleCoverUpload = async () => {
    if (!coverFile) {
      setUploadError('请先选择封面图片');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadError(null);

      // 注意: uploadCover 接口内部已自动更新图书的 coverFileId，无需再次调用 updateBook
      await booksApi.uploadCover(bookId, coverFile);

      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      toast.success('封面上传成功！');
      setCoverFile(null);
    } catch (err: any) {
      setUploadError(err.message || '封面上传失败');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !book) {
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
              修改图书《{book.title}》的完整信息
            </p>
          </div>
        </div>

        {/* Tabs 导航 */}
        <div className="border-b">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Book className="h-4 w-4" />
              基本信息
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'cover'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              封面图片
            </button>
            <button
              onClick={() => setActiveTab('copies')}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'copies'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <PackageOpen className="h-4 w-4" />
              图书载体 {copies && `(${copies.length})`}
            </button>
          </div>
        </div>

        {/* Tab 内容：基本信息 */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本信息</h3>

              <div className="grid gap-x-6 gap-y-4 lg:grid-cols-2">
                {/* 书名 */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    书名 <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* 作者 */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    作者 <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('author')}
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.author && (
                    <p className="text-xs text-destructive mt-1">{errors.author.message}</p>
                  )}
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    ISBN <span className="text-muted-foreground text-xs">(可选)</span>
                  </label>
                  <input
                    {...register('isbn')}
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.isbn && (
                    <p className="text-xs text-destructive mt-1">{errors.isbn.message}</p>
                  )}
                </div>

                {/* 出版社 */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    出版社 <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('publisher')}
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.publisher && (
                    <p className="text-xs text-destructive mt-1">{errors.publisher.message}</p>
                  )}
                </div>

                {/* 分类 */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    分类 <span className="text-destructive">*</span>
                  </label>
                  <select
                    {...register('categoryId')}
                    disabled={categoriesLoading}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">{categoriesLoading ? '加载中...' : '请选择分类'}</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.parentId ? `　${category.name}` : category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* 出版日期 */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">出版日期</label>
                  <input
                    {...register('publishDate')}
                    type="date"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">图书描述</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '保存中...' : '保存更改'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </form>
        )}

        {/* Tab 内容：封面图片 */}
        {activeTab === 'cover' && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
              {/* 左侧：当前封面预览（固定小尺寸） */}
              <div>
                <label className="block text-sm font-medium mb-2">当前封面</label>
                {book.coverFileId ? (
                  <div className="w-[200px] aspect-[3/4]">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/files/${book.coverFileId}/download`}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="w-[200px] aspect-[3/4] rounded-lg border bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">暂无封面</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧：上传区域 */}
              <div className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      上传新封面 {book.coverFileId && <span className="text-muted-foreground text-xs">（将覆盖当前封面）</span>}
                    </label>
                    <ImageUpload
                      onChange={(file) => {
                        setCoverFile(file);
                        setUploadError(null);
                      }}
                      onError={(err) => setUploadError(err)}
                    />
                    {uploadError && (
                      <p className="text-xs text-destructive mt-2">{uploadError}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      支持 JPG、PNG 格式，建议尺寸 400x600 像素，最大 5MB
                    </p>
                  </div>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCoverUpload}
                    disabled={isSubmitting || !coverFile}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? '上传中...' : book.coverFileId ? '覆盖封面' : '上传封面'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverFile(null)}
                    disabled={!coverFile}
                    className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 内容：图书载体 */}
        {activeTab === 'copies' && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">图书载体管理</h3>
                <p className="text-sm text-muted-foreground">
                  点击"编辑"可修改载体信息（库存、位置、状态等）
                </p>
              </div>

              {copiesLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div>加载中...</div>
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
        )}
      </div>
    </DashboardLayout>
  );
}
