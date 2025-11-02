// 共享类型定义

// ========== 用户相关 ==========
export enum UserRole {
  ADMIN = 'ADMIN',
  READER = 'READER',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========== 读者相关 ==========
export enum ReaderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Reader {
  id: string;
  userId: string;
  name: string;
  studentId?: string;
  phone?: string;
  email?: string;
  status: ReaderStatus;
  maxBorrowLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========== 图书相关 ==========
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum FileType {
  PDF = 'pdf',
  EPUB = 'epub',
  IMAGE = 'image',
  OTHER = 'other',
}

export interface Book {
  id: string;
  isbn?: string;  // 改为可选 - 电子资源可能无 ISBN
  title: string;
  author: string;
  publisher: string;
  categoryId: string;
  coverFileId?: string;
  description?: string;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  // ❌ 已移除: totalCopies, availableCopies, contentFileId
  // 这些字段已移至 BookCopy
}

// ========== 图书载体相关 (纸质书 vs 电子书) ==========
export enum BookCopyType {
  PHYSICAL = 'PHYSICAL',  // 纸质图书
  EBOOK = 'EBOOK',        // 电子图书
}

export enum BookCopyStatus {
  AVAILABLE = 'AVAILABLE',      // 可用
  UNAVAILABLE = 'UNAVAILABLE',  // 不可用
  MAINTENANCE = 'MAINTENANCE',  // 维护中
}

export enum EbookFormat {
  PDF = 'pdf',
  EPUB = 'epub',
  MOBI = 'mobi',
}

export interface BookCopy {
  id: string;
  bookId: string;
  type: BookCopyType;
  status: BookCopyStatus;

  // 纸质书字段 (type=PHYSICAL 时有效)
  totalCopies?: number;
  availableCopies?: number;
  location?: string;  // 存放位置，如 "A区-001架"

  // 电子书字段 (type=EBOOK 时有效)
  ebookFormat?: EbookFormat;
  fileId?: string;
  fileSize?: number;

  createdAt: Date;
  updatedAt: Date;
}

// ========== 借阅相关 ==========
export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  readerId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  renewCount: number;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ========== 文件相关 ==========
export interface FileMetadata {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
}

// ========== API 响应类型 ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
