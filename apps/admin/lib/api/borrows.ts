import { apiClient } from './client';
import type {
  BorrowRecord,
  BorrowStatus,
  PaginatedResponse,
  ApiResponse,
} from '@repo/types';

/**
 * 借阅记录查询参数
 */
export interface BorrowQueryParams {
  page?: number;
  pageSize?: number;
  status?: BorrowStatus;
  readerId?: string;
  bookId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 办理借阅 DTO
 */
export interface BorrowBookDto {
  bookId: string;
  readerId: string;
  borrowDays?: number; // 借阅天数,默认30天
}

/**
 * 办理续借 DTO
 */
export interface RenewBorrowDto {
  renewDays?: number; // 续借天数,默认30天
}

/**
 * 借阅记录(带关联信息)
 */
export interface BorrowRecordWithDetails extends BorrowRecord {
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
  reader?: {
    id: string;
    name: string;
    studentId?: string;
  };
}

/**
 * 借阅 API 服务
 */
export const borrowsApi = {
  /**
   * 获取借阅记录列表 (分页)
   */
  async getBorrows(
    params?: BorrowQueryParams
  ): Promise<PaginatedResponse<BorrowRecordWithDetails>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<BorrowRecordWithDetails>>
    >('/borrows', { params });
    return response.data.data!;
  },

  /**
   * 获取单个借阅记录详情
   */
  async getBorrow(id: string): Promise<BorrowRecordWithDetails> {
    const response = await apiClient.get<
      ApiResponse<BorrowRecordWithDetails>
    >(`/borrows/${id}`);
    return response.data.data!;
  },

  /**
   * 办理借阅
   */
  async borrowBook(data: BorrowBookDto): Promise<BorrowRecord> {
    const response = await apiClient.post<ApiResponse<BorrowRecord>>(
      '/borrows',
      data
    );
    return response.data.data!;
  },

  /**
   * 办理归还
   */
  async returnBook(borrowId: string): Promise<BorrowRecord> {
    const response = await apiClient.post<ApiResponse<BorrowRecord>>(
      `/borrows/${borrowId}/return`
    );
    return response.data.data!;
  },

  /**
   * 办理续借
   */
  async renewBorrow(
    borrowId: string,
    data?: RenewBorrowDto
  ): Promise<BorrowRecord> {
    const response = await apiClient.post<ApiResponse<BorrowRecord>>(
      `/borrows/${borrowId}/renew`,
      data
    );
    return response.data.data!;
  },

  /**
   * 获取读者的借阅历史
   */
  async getReaderBorrows(
    readerId: string,
    params?: Omit<BorrowQueryParams, 'readerId'>
  ): Promise<PaginatedResponse<BorrowRecordWithDetails>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<BorrowRecordWithDetails>>
    >(`/readers/${readerId}/borrows`, { params });
    return response.data.data!;
  },

  /**
   * 获取图书的借阅历史
   */
  async getBookBorrows(
    bookId: string,
    params?: Omit<BorrowQueryParams, 'bookId'>
  ): Promise<PaginatedResponse<BorrowRecordWithDetails>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<BorrowRecordWithDetails>>
    >(`/books/${bookId}/borrows`, { params });
    return response.data.data!;
  },

  /**
   * 获取逾期借阅记录
   */
  async getOverdueBorrows(
    params?: Omit<BorrowQueryParams, 'status'>
  ): Promise<PaginatedResponse<BorrowRecordWithDetails>> {
    return this.getBorrows({ ...params, status: 'OVERDUE' as BorrowStatus });
  },
};
