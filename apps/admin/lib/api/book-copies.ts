import { apiClient } from './client';
import type { BookCopy, BookCopyType, EbookFormat, ApiResponse } from '@repo/types';

/**
 * 创建图书载体 DTO
 */
export interface CreateBookCopyDto {
  bookId: string;
  type: BookCopyType;

  // 纸质书字段 (type=PHYSICAL 时必填)
  totalCopies?: number;
  location?: string;

  // 电子书字段 (type=EBOOK 时必填)
  ebookFormat?: EbookFormat;
  fileId?: string;
  fileSize?: number;
}

/**
 * 更新图书载体 DTO
 */
export interface UpdateBookCopyDto extends Partial<Omit<CreateBookCopyDto, 'bookId' | 'type'>> {
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
}

/**
 * 图书载体 API 服务
 */
export const bookCopiesApi = {
  /**
   * 创建图书载体
   */
  async createBookCopy(data: CreateBookCopyDto): Promise<BookCopy> {
    const response = await apiClient.post<ApiResponse<BookCopy>>('/book-copies', data);
    return response.data.data!;
  },

  /**
   * 获取某本书的所有载体
   */
  async getBookCopies(bookId: string): Promise<BookCopy[]> {
    const response = await apiClient.get<ApiResponse<BookCopy[]>>(`/books/${bookId}/copies`);
    return response.data.data!;
  },

  /**
   * 获取某个载体详情
   */
  async getBookCopy(id: string): Promise<BookCopy> {
    const response = await apiClient.get<ApiResponse<BookCopy>>(`/book-copies/${id}`);
    return response.data.data!;
  },

  /**
   * 更新图书载体
   */
  async updateBookCopy(id: string, data: UpdateBookCopyDto): Promise<BookCopy> {
    const response = await apiClient.patch<ApiResponse<BookCopy>>(
      `/book-copies/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * 删除图书载体
   */
  async deleteBookCopy(id: string): Promise<void> {
    await apiClient.delete(`/book-copies/${id}`);
  },

  /**
   * 获取载体统计信息
   */
  async getBookCopyStats(bookId: string): Promise<{
    total: number;
    physical: number;
    ebook: number;
    available: number;
  }> {
    const response = await apiClient.get<ApiResponse<any>>(`/books/${bookId}/copies/stats`);
    return response.data.data!;
  },
};
