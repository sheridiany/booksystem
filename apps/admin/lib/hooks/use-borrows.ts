import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  borrowsApi,
  type BorrowQueryParams,
  type BorrowBookDto,
  type RenewBorrowDto,
} from '../api/borrows';

/**
 * 借阅相关 Query Keys
 */
export const borrowKeys = {
  all: ['borrows'] as const,
  lists: () => [...borrowKeys.all, 'list'] as const,
  list: (params?: BorrowQueryParams) =>
    [...borrowKeys.lists(), params] as const,
  details: () => [...borrowKeys.all, 'detail'] as const,
  detail: (id: string) => [...borrowKeys.details(), id] as const,
  readerBorrows: (readerId: string) =>
    [...borrowKeys.all, 'reader', readerId] as const,
  bookBorrows: (bookId: string) =>
    [...borrowKeys.all, 'book', bookId] as const,
  overdue: () => [...borrowKeys.all, 'overdue'] as const,
};

/**
 * 获取借阅记录列表
 */
export function useBorrows(params?: BorrowQueryParams) {
  return useQuery({
    queryKey: borrowKeys.list(params),
    queryFn: () => borrowsApi.getBorrows(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * 获取单个借阅记录详情
 */
export function useBorrow(id: string | undefined) {
  return useQuery({
    queryKey: borrowKeys.detail(id!),
    queryFn: () => borrowsApi.getBorrow(id!),
    enabled: !!id,
  });
}

/**
 * 办理借阅
 */
export function useBorrowBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BorrowBookDto) => borrowsApi.borrowBook(data),
    onSuccess: () => {
      // 使所有借阅列表查询失效
      queryClient.invalidateQueries({ queryKey: borrowKeys.lists() });
    },
  });
}

/**
 * 办理归还
 */
export function useReturnBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowId: string) => borrowsApi.returnBook(borrowId),
    onSuccess: (_, borrowId) => {
      // 使列表和详情查询失效
      queryClient.invalidateQueries({ queryKey: borrowKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: borrowKeys.detail(borrowId),
      });
    },
  });
}

/**
 * 办理续借
 */
export function useRenewBorrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      borrowId,
      data,
    }: {
      borrowId: string;
      data?: RenewBorrowDto;
    }) => borrowsApi.renewBorrow(borrowId, data),
    onSuccess: (_, variables) => {
      // 使列表和详情查询失效
      queryClient.invalidateQueries({ queryKey: borrowKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: borrowKeys.detail(variables.borrowId),
      });
    },
  });
}

/**
 * 获取读者的借阅历史
 */
export function useReaderBorrows(
  readerId: string | undefined,
  params?: Omit<BorrowQueryParams, 'readerId'>
) {
  return useQuery({
    queryKey: borrowKeys.readerBorrows(readerId!),
    queryFn: () => borrowsApi.getReaderBorrows(readerId!, params),
    enabled: !!readerId,
  });
}

/**
 * 获取图书的借阅历史
 */
export function useBookBorrows(
  bookId: string | undefined,
  params?: Omit<BorrowQueryParams, 'bookId'>
) {
  return useQuery({
    queryKey: borrowKeys.bookBorrows(bookId!),
    queryFn: () => borrowsApi.getBookBorrows(bookId!, params),
    enabled: !!bookId,
  });
}

/**
 * 获取逾期借阅记录
 */
export function useOverdueBorrows(
  params?: Omit<BorrowQueryParams, 'status'>
) {
  return useQuery({
    queryKey: borrowKeys.overdue(),
    queryFn: () => borrowsApi.getOverdueBorrows(params),
    // 逾期数据每5分钟自动刷新
    refetchInterval: 5 * 60 * 1000,
  });
}
