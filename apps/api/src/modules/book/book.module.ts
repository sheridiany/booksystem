import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// Domain
import { BOOK_REPOSITORY } from './domain/repositories/book.repository.interface';
import { BOOK_COPY_REPOSITORY } from './domain/repositories/book-copy.repository.interface';

// Infrastructure
import { BookRepository } from './infrastructure/repositories/book.repository';
import { BookCopyRepository } from './infrastructure/repositories/book-copy.repository';

// Application - Book Use Cases
import { CreateBookUseCase } from './application/use-cases/create-book.use-case';
import { UpdateBookUseCase } from './application/use-cases/update-book.use-case';
import { DeleteBookUseCase } from './application/use-cases/delete-book.use-case';
import { GetBooksUseCase } from './application/use-cases/get-books.use-case';

// Application - BookCopy Use Cases
import { CreateBookCopyUseCase } from './application/use-cases/create-book-copy.use-case';
import { UpdateBookCopyUseCase } from './application/use-cases/update-book-copy.use-case';
import { DeleteBookCopyUseCase } from './application/use-cases/delete-book-copy.use-case';
import {
  GetBookCopiesUseCase,
  GetBookCopyByIdUseCase,
  GetBookCopiesByBookIdUseCase,
} from './application/use-cases/get-book-copies.use-case';

// Presentation
import { BookController } from './presentation/controllers/book.controller';
import {
  BookCopyController,
  BookCopiesOfBookController,
} from './presentation/controllers/book-copy.controller';

// 导入 CategoryModule 以使用 CATEGORY_REPOSITORY
import { CategoryModule } from '../category/category.module';
// 导入 FileModule 以使用文件上传功能
import { FileModule } from '../file/file.module';

@Module({
  imports: [PrismaModule, CategoryModule, FileModule],
  controllers: [
    BookController,
    BookCopyController,
    BookCopiesOfBookController,
  ],
  providers: [
    // Repositories
    {
      provide: BOOK_REPOSITORY,
      useClass: BookRepository,
    },
    {
      provide: BOOK_COPY_REPOSITORY,
      useClass: BookCopyRepository,
    },
    // Book Use Cases
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    GetBooksUseCase,
    // BookCopy Use Cases
    CreateBookCopyUseCase,
    UpdateBookCopyUseCase,
    DeleteBookCopyUseCase,
    GetBookCopiesUseCase,
    GetBookCopyByIdUseCase,
    GetBookCopiesByBookIdUseCase,
  ],
  exports: [
    BOOK_REPOSITORY,
    BOOK_COPY_REPOSITORY, // 导出给借阅模块使用
  ],
})
export class BookModule {}
