import { apiClient } from './client';
import type {
  Reader,
  ReaderStatus,
  PaginatedResponse,
  ApiResponse,
} from '@repo/types';

/**
 * 读者查询参数
 */
export interface ReaderQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: ReaderStatus;
  studentId?: string;
}

/**
 * 创建读者 DTO
 */
export interface CreateReaderDto {
  name: string;
  studentId?: string;
  phone?: string;
  email?: string;
  maxBorrowLimit?: number; // 默认5本
}

/**
 * 更新读者 DTO
 */
export interface UpdateReaderDto extends Partial<CreateReaderDto> {
  status?: ReaderStatus;
}

/**
 * 读者统计信息
 */
export interface ReaderStatistics {
  totalBorrows: number;
  currentBorrows: number;
  overdueCount: number;
  historyBorrows: number;
}

/**
 * 读者(带统计信息)
 */
export interface ReaderWithStats extends Reader {
  statistics?: ReaderStatistics;
}

/**
 * 读者 API 服务
 */
export const readersApi = {
  /**
   * 获取读者列表 (分页)
   */
  async getReaders(
    params?: ReaderQueryParams
  ): Promise<PaginatedResponse<Reader>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Reader>>
    >('/readers', { params });
    return response.data.data!;
  },

  /**
   * 获取单个读者详情
   */
  async getReader(id: string): Promise<ReaderWithStats> {
    const response = await apiClient.get<ApiResponse<ReaderWithStats>>(
      `/readers/${id}`
    );
    return response.data.data!;
  },

  /**
   * 创建读者
   */
  async createReader(data: CreateReaderDto): Promise<Reader> {
    const response = await apiClient.post<ApiResponse<Reader>>(
      '/readers',
      data
    );
    return response.data.data!;
  },

  /**
   * 更新读者
   */
  async updateReader(
    id: string,
    data: UpdateReaderDto
  ): Promise<Reader> {
    const response = await apiClient.patch<ApiResponse<Reader>>(
      `/readers/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * 删除读者
   */
  async deleteReader(id: string): Promise<void> {
    await apiClient.delete(`/readers/${id}`);
  },

  /**
   * 激活读者
   */
  async activateReader(id: string): Promise<Reader> {
    const response = await apiClient.post<ApiResponse<Reader>>(
      `/readers/${id}/activate`
    );
    return response.data.data!;
  },

  /**
   * 禁用读者
   */
  async deactivateReader(id: string): Promise<Reader> {
    const response = await apiClient.post<ApiResponse<Reader>>(
      `/readers/${id}/deactivate`
    );
    return response.data.data!;
  },

  /**
   * 根据学号查找读者
   */
  async getReaderByStudentId(studentId: string): Promise<Reader | null> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Reader>>
    >('/readers', {
      params: { studentId, pageSize: 1 },
    });
    const readers = response.data.data!.items;
    return readers.length > 0 ? readers[0] : null;
  },

  /**
   * 获取读者统计信息
   */
  async getReaderStatistics(id: string): Promise<ReaderStatistics> {
    const response = await apiClient.get<ApiResponse<ReaderStatistics>>(
      `/readers/${id}/statistics`
    );
    return response.data.data!;
  },
};
