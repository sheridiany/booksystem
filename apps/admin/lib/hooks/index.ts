/**
 * 自定义 Hooks 统一导出
 *
 * 使用示例:
 * import { useBooks, useCreateBook } from '@/lib/hooks';
 */

// 图书相关 hooks
export {
  useBooks,
  useBook,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useUploadBookCover,
  useUploadBookContent,
  bookKeys,
} from './use-books';

// 借阅相关 hooks
export {
  useBorrows,
  useBorrow,
  useBorrowBook,
  useReturnBook,
  useRenewBorrow,
  useReaderBorrows,
  useBookBorrows,
  useOverdueBorrows,
  borrowKeys,
} from './use-borrows';

// 读者相关 hooks
export {
  useReaders,
  useReader,
  useCreateReader,
  useUpdateReader,
  useDeleteReader,
  useActivateReader,
  useDeactivateReader,
  useReaderByStudentId,
  useReaderStatistics,
  readerKeys,
} from './use-readers';
