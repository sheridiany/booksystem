import axios from 'axios';

// API 基础 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  },

  /**
   * 获取根分类
   */
  async getRootCategories(): Promise<Category[]> {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: { parentId: 'root' },
    });
    return response.data;
  },

  /**
   * 获取子分类
   */
  async getChildCategories(parentId: string): Promise<Category[]> {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: { parentId },
    });
    return response.data;
  },

  /**
   * 创建分类
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await axios.post(`${API_BASE_URL}/categories`, data);
    return response.data;
  },

  /**
   * 更新分类
   */
  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await axios.put(`${API_BASE_URL}/categories/${id}`, data);
    return response.data;
  },

  /**
   * 删除分类
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/categories/${id}`);
    return response.data;
  },
};
