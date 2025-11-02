import { apiClient } from './client';
import type { Book, PaginatedResponse, ApiResponse } from '@repo/types';

/**
 * 图书查询参数
 */
export interface BookQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  isbn?: string;
}

/**
 * 创建图书 DTO (仅元信息)
 */
export interface CreateBookDto {
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  isbn?: string;  // 改为可选 - 电子资源可能无 ISBN
  description?: string;
  publishDate?: string;
  coverFileId?: string;  // 封面文件 ID
  // ❌ 已移除: totalCopies - 已移至 BookCopy
}

/**
 * 更新图书 DTO
 */
export interface UpdateBookDto extends Partial<CreateBookDto> {
  id: string;
}

/**
 * 图书 API 服务
 */
export const booksApi = {
  /**
   * 获取图书列表 (分页)
   */
  async getBooks(params?: BookQueryParams): Promise<PaginatedResponse<Book>> {
    // 过滤掉空值参数
    const filteredParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        )
      : {};

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Book>>>(
      '/books',
      { params: filteredParams }
    );
    return response.data.data!;
  },

  /**
   * 获取单个图书详情
   */
  async getBook(id: string): Promise<Book> {
    const response = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return response.data.data!;
  },

  /**
   * 创建图书
   */
  async createBook(data: CreateBookDto): Promise<Book> {
    const response = await apiClient.post<ApiResponse<Book>>('/books', data);
    return response.data.data!;
  },

  /**
   * 更新图书
   */
  async updateBook(id: string, data: Partial<CreateBookDto>): Promise<Book> {
    const response = await apiClient.patch<ApiResponse<Book>>(
      `/books/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * 删除图书
   */
  async deleteBook(id: string): Promise<void> {
    await apiClient.delete(`/books/${id}`);
  },

  /**
   * 上传图书封面
   */
  async uploadCover(bookId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{ fileId: string }>>(
      `/books/${bookId}/cover`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!.fileId;
  },

  /**
   * 上传图书内容文件
   */
  async uploadContent(bookId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{ fileId: string }>>(
      `/books/${bookId}/content`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!.fileId;
  },
};
