import { Inject, Injectable } from '@nestjs/common';
import { BookCopy } from '../../domain/entities/book-copy.entity';
import {
  IBookCopyRepository,
  BOOK_COPY_REPOSITORY,
} from '../../domain/repositories/book-copy.repository.interface';
import { QueryBookCopiesDto } from '../dto/book-copy.dto';

/**
 * 查询图书载体列表用例
 */
@Injectable()
export class GetBookCopiesUseCase {
  constructor(
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
  ) {}

  async execute(dto: QueryBookCopiesDto): Promise<{
    items: BookCopy[];
    total: number;
  }> {
    return await this.bookCopyRepository.findAll({
      page: dto.page,
      pageSize: dto.pageSize,
      bookId: dto.bookId,
      type: dto.type,
      status: dto.status,
    });
  }
}

/**
 * 获取指定图书的所有载体用例
 */
@Injectable()
export class GetBookCopiesByBookIdUseCase {
  constructor(
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
  ) {}

  async execute(bookId: string): Promise<BookCopy[]> {
    return await this.bookCopyRepository.findByBookId(bookId);
  }
}

/**
 * 获取单个载体详情用例
 */
@Injectable()
export class GetBookCopyByIdUseCase {
  constructor(
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
  ) {}

  async execute(id: string): Promise<BookCopy> {
    const bookCopy = await this.bookCopyRepository.findById(id);
    if (!bookCopy) {
      throw new Error(`图书载体不存在: ${id}`);
    }
    return bookCopy;
  }
}
