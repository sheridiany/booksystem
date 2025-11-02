import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BookCopy } from '../../domain/entities/book-copy.entity';
import { IBookCopyRepository, BOOK_COPY_REPOSITORY } from '../../domain/repositories/book-copy.repository.interface';
import { IBookRepository, BOOK_REPOSITORY } from '../../domain/repositories/book.repository.interface';
import { CreateBookCopyDto } from '../dto/book-copy.dto';

/**
 * 创建图书载体用例
 *
 * 业务规则：
 * 1. 验证图书是否存在
 * 2. 验证载体类型和必填字段
 * 3. 如果是电子书，验证文件是否存在
 * 4. 创建载体实体并持久化
 */
@Injectable()
export class CreateBookCopyUseCase {
  constructor(
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(dto: CreateBookCopyDto): Promise<BookCopy> {
    // 1. 验证图书是否存在
    const book = await this.bookRepository.findById(dto.bookId);
    if (!book) {
      throw new Error(`图书不存在: ${dto.bookId}`);
    }

    // 2. 根据类型创建载体实体（实体内部会进行字段验证）
    const bookCopy = new BookCopy({
      id: randomUUID(),
      bookId: dto.bookId,
      type: dto.type,
      // 纸质书字段
      totalCopies: dto.totalCopies,
      availableCopies: dto.totalCopies, // 初始时可用库存等于总库存
      location: dto.location,
      // 电子书字段
      ebookFormat: dto.ebookFormat,
      fileId: dto.fileId,
      fileSize: dto.fileSize,
    });

    // 3. 持久化
    const savedBookCopy = await this.bookCopyRepository.save(bookCopy);

    return savedBookCopy;
  }
}
