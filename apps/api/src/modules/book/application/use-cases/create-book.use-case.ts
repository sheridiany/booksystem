import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IBookRepository, BOOK_REPOSITORY } from '../../domain/repositories/book.repository.interface';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../../category/domain/repositories/category.repository.interface';
import { Book } from '../../domain/entities/book.entity';
import { CreateBookDto } from '../dto/book.dto';

/**
 * 创建图书用例
 *
 * 职责变更：仅创建图书元信息
 * 载体管理（库存等）已移至 BookCopy 模块
 *
 * 业务规则：
 * 1. ISBN 必须唯一（如果提供）
 * 2. 分类必须存在
 */
@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateBookDto): Promise<Book> {
    // 1. 验证 ISBN 唯一性（如果提供）
    if (dto.isbn) {
      const isbnExists = await this.bookRepository.existsByISBN(dto.isbn);
      if (isbnExists) {
        throw new ConflictException(`ISBN 已存在: ${dto.isbn}`);
      }
    }

    // 2. 验证分类存在
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException(`分类不存在: ${dto.categoryId}`);
    }

    // 3. 创建图书实体（仅元信息）
    const book = new Book({
      id: uuidv4(),
      isbn: dto.isbn || null,
      title: dto.title,
      author: dto.author,
      publisher: dto.publisher,
      categoryId: dto.categoryId,
      coverFileId: dto.coverFileId || null,
      description: dto.description || null,
      publishDate: dto.publishDate ? new Date(dto.publishDate) : null,
    });

    // 4. 保存图书
    return await this.bookRepository.save(book);
  }
}
