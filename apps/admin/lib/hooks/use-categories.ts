import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi, type Category, type CreateCategoryDto, type UpdateCategoryDto } from '../api/category.api';

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  root: ['categories', 'root'] as const,
  children: (parentId: string) => ['categories', 'children', parentId] as const,
};

/**
 * 获取所有分类
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoryApi.getAll,
  });
}

/**
 * 获取根分类
 */
export function useRootCategories() {
  return useQuery({
    queryKey: categoryKeys.root,
    queryFn: categoryApi.getRootCategories,
  });
}

/**
 * 获取子分类
 */
export function useChildCategories(parentId: string) {
  return useQuery({
    queryKey: categoryKeys.children(parentId),
    queryFn: () => categoryApi.getChildCategories(parentId),
    enabled: !!parentId,
  });
}

/**
 * 创建分类
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryApi.create(data),
    onSuccess: () => {
      // 使所有分类查询失效,触发重新获取
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.root });
    },
  });
}

/**
 * 更新分类
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.root });
    },
  });
}

/**
 * 删除分类
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.root });
    },
  });
}

/**
 * 批量删除分类
 */
export function useBatchDeleteCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // 并发删除所有分类
      await Promise.all(ids.map((id) => categoryApi.delete(id)));
      return { deletedCount: ids.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.root });
    },
  });
}

/**
 * 批量移动分类
 */
export function useBatchMoveCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, targetParentId }: { ids: string[]; targetParentId: string | null }) => {
      // 并发更新所有分类的父分类
      await Promise.all(
        ids.map((id) =>
          categoryApi.update(id, { parentId: targetParentId })
        )
      );
      return { movedCount: ids.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.root });
    },
  });
}
