import { Inject, Injectable } from '@nestjs/common';
import { BookCopy, BookCopyType } from '../../domain/entities/book-copy.entity';
import {
  IBookCopyRepository,
  BOOK_COPY_REPOSITORY,
} from '../../domain/repositories/book-copy.repository.interface';
import { UpdateBookCopyDto } from '../dto/book-copy.dto';

/**
 * 更新图书载体用例
 */
@Injectable()
export class UpdateBookCopyUseCase {
  constructor(
    @Inject(BOOK_COPY_REPOSITORY)
    private readonly bookCopyRepository: IBookCopyRepository,
  ) {}

  async execute(id: string, dto: UpdateBookCopyDto): Promise<BookCopy> {
    // 1. 查找现有载体
    const bookCopy = await this.bookCopyRepository.findById(id);
    if (!bookCopy) {
      throw new Error(`图书载体不存在: ${id}`);
    }

    // 2. 根据类型更新相应字段
    if (dto.status !== undefined) {
      bookCopy.updateStatus(dto.status);
    }

    // 纸质书更新
    if (bookCopy.type === BookCopyType.PHYSICAL) {
      if (dto.totalCopies !== undefined) {
        bookCopy.updateTotalCopies(dto.totalCopies);
      }
      if (dto.location !== undefined) {
        bookCopy.updateLocation(dto.location);
      }
    }

    // 电子书更新
    if (bookCopy.type === BookCopyType.EBOOK) {
      if (dto.fileId !== undefined) {
        bookCopy.updateEbookFile(dto.fileId, dto.fileSize);
      }
    }

    // 3. 持久化
    return await this.bookCopyRepository.save(bookCopy);
  }
}
