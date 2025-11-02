import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBookRepository, BOOK_REPOSITORY } from '../../domain/repositories/book.repository.interface';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../../category/domain/repositories/category.repository.interface';
import { Book } from '../../domain/entities/book.entity';
import { UpdateBookDto } from '../dto/book.dto';

/**
 * 更新图书用例
 *
 * 业务规则：
 * 1. 图书必须存在
 * 2. 更新分类时，分类必须存在
 * 3. 更新总库存时，不能少于已借出数量
 */
@Injectable()
export class UpdateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateBookDto): Promise<Book> {
    // 1. 查找图书
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${id}`);
    }

    // 2. 验证分类存在 (如果需要更新分类)
    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundException(`分类不存在: ${dto.categoryId}`);
      }
      book.updateCategory(dto.categoryId);
    }

    // 3. 更新基本信息
    if (
      dto.title !== undefined ||
      dto.author !== undefined ||
      dto.publisher !== undefined ||
      dto.description !== undefined ||
      dto.publishDate !== undefined
    ) {
      book.updateInfo({
        title: dto.title,
        author: dto.author,
        publisher: dto.publisher,
        description: dto.description,
        publishDate: dto.publishDate ? new Date(dto.publishDate) : null,
      });
    }

    // 4. 更新总库存
    if (dto.totalCopies !== undefined) {
      book.updateTotalCopies(dto.totalCopies);
    }

    // 5. 更新封面文件
    if (dto.coverFileId !== undefined) {
      book.updateCoverFile(dto.coverFileId);
    }

    // 6. 更新内容文件
    if (dto.contentFileId !== undefined) {
      book.updateContentFile(dto.contentFileId);
    }

    // 7. 保存更新
    return await this.bookRepository.save(book);
  }
}
