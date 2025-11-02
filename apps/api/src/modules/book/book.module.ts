import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// Domain
import { BOOK_REPOSITORY } from './domain/repositories/book.repository.interface';

// Infrastructure
import { BookRepository } from './infrastructure/repositories/book.repository';

// Application
import { CreateBookUseCase } from './application/use-cases/create-book.use-case';
import { UpdateBookUseCase } from './application/use-cases/update-book.use-case';
import { DeleteBookUseCase } from './application/use-cases/delete-book.use-case';
import { GetBooksUseCase } from './application/use-cases/get-books.use-case';

// Presentation
import { BookController } from './presentation/controllers/book.controller';

// 导入 CategoryModule 以使用 CATEGORY_REPOSITORY
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [PrismaModule, CategoryModule],
  controllers: [BookController],
  providers: [
    // Repository
    {
      provide: BOOK_REPOSITORY,
      useClass: BookRepository,
    },
    // Use Cases
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    GetBooksUseCase,
  ],
  exports: [BOOK_REPOSITORY], // 导出给借阅模块使用
})
export class BookModule {}
