import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  readersApi,
  type ReaderQueryParams,
  type CreateReaderDto,
  type UpdateReaderDto,
} from '../api/readers';

/**
 * 读者相关 Query Keys
 */
export const readerKeys = {
  all: ['readers'] as const,
  lists: () => [...readerKeys.all, 'list'] as const,
  list: (params?: ReaderQueryParams) =>
    [...readerKeys.lists(), params] as const,
  details: () => [...readerKeys.all, 'detail'] as const,
  detail: (id: string) => [...readerKeys.details(), id] as const,
  statistics: (id: string) =>
    [...readerKeys.all, 'statistics', id] as const,
  byStudentId: (studentId: string) =>
    [...readerKeys.all, 'studentId', studentId] as const,
};

/**
 * 获取读者列表
 */
export function useReaders(params?: ReaderQueryParams) {
  return useQuery({
    queryKey: readerKeys.list(params),
    queryFn: () => readersApi.getReaders(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * 获取单个读者详情
 */
export function useReader(id: string | undefined) {
  return useQuery({
    queryKey: readerKeys.detail(id!),
    queryFn: () => readersApi.getReader(id!),
    enabled: !!id,
  });
}

/**
 * 创建读者
 */
export function useCreateReader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReaderDto) => readersApi.createReader(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() });
    },
  });
}

/**
 * 更新读者
 */
export function useUpdateReader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReaderDto }) =>
      readersApi.updateReader(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: readerKeys.detail(variables.id),
      });
    },
  });
}

/**
 * 删除读者
 */
export function useDeleteReader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => readersApi.deleteReader(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() });
    },
  });
}

/**
 * 激活读者
 */
export function useActivateReader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => readersApi.activateReader(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: readerKeys.detail(id) });
    },
  });
}

/**
 * 禁用读者
 */
export function useDeactivateReader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => readersApi.deactivateReader(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: readerKeys.detail(id) });
    },
  });
}

/**
 * 根据学号查找读者
 */
export function useReaderByStudentId(studentId: string | undefined) {
  return useQuery({
    queryKey: readerKeys.byStudentId(studentId!),
    queryFn: () => readersApi.getReaderByStudentId(studentId!),
    enabled: !!studentId && studentId.length > 0,
  });
}

/**
 * 获取读者统计信息
 */
export function useReaderStatistics(id: string | undefined) {
  return useQuery({
    queryKey: readerKeys.statistics(id!),
    queryFn: () => readersApi.getReaderStatistics(id!),
    enabled: !!id,
  });
}
