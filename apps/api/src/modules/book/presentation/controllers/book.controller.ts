import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookUseCase } from '../../application/use-cases/create-book.use-case';
import { UpdateBookUseCase } from '../../application/use-cases/update-book.use-case';
import { DeleteBookUseCase } from '../../application/use-cases/delete-book.use-case';
import { GetBooksUseCase } from '../../application/use-cases/get-books.use-case';
import {
  CreateBookDto,
  UpdateBookDto,
  QueryBooksDto,
  BookDto,
  PaginatedBooksDto,
} from '../../application/dto/book.dto';

/**
 * 图书管理控制器
 *
 * 路由: /api/v1/books
 */
@Controller('books')
export class BookController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    private readonly deleteBookUseCase: DeleteBookUseCase,
    private readonly getBooksUseCase: GetBooksUseCase,
  ) {}

  /**
   * 创建图书
   * POST /api/v1/books
   */
  @Post()
  async create(@Body() dto: CreateBookDto): Promise<BookDto> {
    const book = await this.createBookUseCase.execute(dto);
    return BookDto.fromEntity(book);
  }

  /**
   * 获取图书列表 (支持分页和搜索)
   * GET /api/v1/books?page=1&pageSize=20&categoryId=xxx&search=xxx
   */
  @Get()
  async findAll(@Query() query: QueryBooksDto): Promise<PaginatedBooksDto> {
    const result = await this.getBooksUseCase.execute(query);

    const response = new PaginatedBooksDto();
    response.items = result.items.map((book) => BookDto.fromEntity(book, true));
    response.total = result.total;
    response.page = result.page;
    response.pageSize = result.pageSize;
    response.totalPages = Math.ceil(result.total / result.pageSize);

    return response;
  }

  /**
   * 获取图书详情
   * GET /api/v1/books/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookDto> {
    const book = await this.getBooksUseCase.getById(id);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${id}`);
    }

    return BookDto.fromEntity(book, true);
  }

  /**
   * 获取热门图书
   * GET /api/v1/books/popular/list
   */
  @Get('popular/list')
  async getPopular(@Query('limit') limit?: string): Promise<BookDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const books = await this.getBooksUseCase.getPopular(limitNum);
    return books.map((book) => BookDto.fromEntity(book, true));
  }

  /**
   * 根据分类获取图书
   * GET /api/v1/books/category/:categoryId
   */
  @Get('category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: string): Promise<BookDto[]> {
    const books = await this.getBooksUseCase.getByCategory(categoryId);
    return books.map((book) => BookDto.fromEntity(book));
  }

  /**
   * 更新图书
   * PUT /api/v1/books/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ): Promise<BookDto> {
    const book = await this.updateBookUseCase.execute(id, dto);
    return BookDto.fromEntity(book);
  }

  /**
   * 删除图书
   * DELETE /api/v1/books/:id
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.deleteBookUseCase.execute(id);
    return { message: '图书删除成功' };
  }
}
