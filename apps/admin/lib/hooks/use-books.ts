import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi, type BookQueryParams, type CreateBookDto } from '../api/books';
import type { Book } from '@repo/types';

/**
 * 图书相关 Query Keys
 */
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params?: BookQueryParams) =>
    [...bookKeys.lists(), params] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

/**
 * 获取图书列表
 */
export function useBooks(params?: BookQueryParams) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => booksApi.getBooks(params),
    placeholderData: (prev) => prev, // 保持上一次数据,避免闪烁
  });
}

/**
 * 获取单个图书详情
 */
export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: bookKeys.detail(id!),
    queryFn: () => booksApi.getBook(id!),
    enabled: !!id, // 只有 id 存在时才执行
  });
}

/**
 * 创建图书
 */
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookDto) => booksApi.createBook(data),
    onSuccess: () => {
      // 创建成功后,使所有图书列表查询失效
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

/**
 * 更新图书
 */
export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBookDto> }) =>
      booksApi.updateBook(id, data),
    onSuccess: (_, variables) => {
      // 更新成功后,使列表和详情查询失效
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookKeys.detail(variables.id),
      });
    },
  });
}

/**
 * 删除图书
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => booksApi.deleteBook(id),
    onSuccess: () => {
      // 删除成功后,使所有图书列表查询失效
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

/**
 * 上传图书封面
 */
export function useUploadBookCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, file }: { bookId: string; file: File }) =>
      booksApi.uploadCover(bookId, file),
    onSuccess: (_, variables) => {
      // 上传成功后,使对应图书详情失效
      queryClient.invalidateQueries({
        queryKey: bookKeys.detail(variables.bookId),
      });
    },
  });
}

/**
 * 上传图书内容
 */
export function useUploadBookContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, file }: { bookId: string; file: File }) =>
      booksApi.uploadContent(bookId, file),
    onSuccess: (_, variables) => {
      // 上传成功后,使对应图书详情失效
      queryClient.invalidateQueries({
        queryKey: bookKeys.detail(variables.bookId),
      });
    },
  });
}
