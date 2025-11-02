import { apiClient } from './client';

// 分类类型定义
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  sort: number;
  createdAt: string;
  updatedAt: string;
  bookCount?: number; // 前端扩展字段
}

// 创建分类 DTO
export interface CreateCategoryDto {
  name: string;
  parentId?: string | null;
  sort?: number;
}

// 更新分类 DTO
export interface UpdateCategoryDto {
  name?: string;
  parentId?: string | null;
  sort?: number;
}

// 分类 API 客户端
export const categoryApi = {
  /**
   * 获取所有分类
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    // 后端返回格式: { success: true, data: [...] }
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * 获取根分类
   */
  async getRootCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories', {
      params: { parentId: 'root' },
    });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * 获取子分类
   */
  async getChildCategories(parentId: string): Promise<Category[]> {
    const response = await apiClient.get('/categories', {
      params: { parentId },
    });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * 创建分类
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post('/categories', data);
    return response.data.data || response.data;
  },

  /**
   * 更新分类
   */
  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * 删除分类
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data.data || response.data;
  },
};
