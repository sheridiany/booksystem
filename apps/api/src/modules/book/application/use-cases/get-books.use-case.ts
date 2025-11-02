import { Injectable, Inject } from '@nestjs/common';
import { IBookRepository, BOOK_REPOSITORY } from '../../domain/repositories/book.repository.interface';
import { Book } from '../../domain/entities/book.entity';
import { QueryBooksDto } from '../dto/book.dto';

/**
 * 获取图书列表用例
 *
 * 支持：
 * - 分页
 * - 分类过滤
 * - 搜索 (标题、作者、ISBN)
 */
@Injectable()
export class GetBooksUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  /**
   * 获取图书列表 (分页)
   */
  async execute(query: QueryBooksDto = {}): Promise<{
    items: Book[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const result = await this.bookRepository.findAll({
      page,
      pageSize,
      categoryId: query.categoryId,
      search: query.search,
    });

    return {
      items: result.items,
      total: result.total,
      page,
      pageSize,
    };
  }

  /**
   * 根据分类获取图书
   */
  async getByCategory(categoryId: string): Promise<Book[]> {
    return await this.bookRepository.findByCategoryId(categoryId);
  }

  /**
   * 根据 ID 获取图书详情
   */
  async getById(id: string): Promise<Book | null> {
    return await this.bookRepository.findById(id);
  }

  /**
   * 获取热门图书
   */
  async getPopular(limit = 10): Promise<Book[]> {
    return await this.bookRepository.findPopular(limit);
  }
}
