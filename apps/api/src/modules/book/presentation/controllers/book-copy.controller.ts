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
  BadRequestException,
} from '@nestjs/common';
import { CreateBookCopyUseCase } from '../../application/use-cases/create-book-copy.use-case';
import { UpdateBookCopyUseCase } from '../../application/use-cases/update-book-copy.use-case';
import { DeleteBookCopyUseCase } from '../../application/use-cases/delete-book-copy.use-case';
import {
  GetBookCopiesUseCase,
  GetBookCopyByIdUseCase,
  GetBookCopiesByBookIdUseCase,
} from '../../application/use-cases/get-book-copies.use-case';
import {
  CreateBookCopyDto,
  UpdateBookCopyDto,
  QueryBookCopiesDto,
  BookCopyDto,
  PaginatedBookCopiesDto,
  BookCopyStatsDto,
} from '../../application/dto/book-copy.dto';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/entities/user.entity';

/**
 * 图书载体管理控制器
 *
 * 路由: /api/v1/book-copies
 *
 * 职责：管理图书的具体载体（纸质书/电子书）
 * 权限说明: 见下方各接口注释
 */
@Controller('book-copies')
@Roles(UserRole.ADMIN)

export class BookCopyController {
  constructor(
    private readonly createBookCopyUseCase: CreateBookCopyUseCase,
    private readonly updateBookCopyUseCase: UpdateBookCopyUseCase,
    private readonly deleteBookCopyUseCase: DeleteBookCopyUseCase,
    private readonly getBookCopiesUseCase: GetBookCopiesUseCase,
    private readonly getBookCopyByIdUseCase: GetBookCopyByIdUseCase,
    // private readonly getBookCopiesByBookIdUseCase: GetBookCopiesByBookIdUseCase, // 在 BookCopiesOfBookController 中使用
  ) {}

  /**
   * 创建图书载体
   * POST /api/v1/book-copies
   *
   * 示例请求体（纸质书）:
   * {
   *   "bookId": "uuid",
   *   "type": "PHYSICAL",
   *   "totalCopies": 10,
   *   "location": "A区-001架"
   * }
   *
   * 示例请求体（电子书）:
   * {
   *   "bookId": "uuid",
   *   "type": "EBOOK",
   *   "ebookFormat": "pdf",
   *   "fileId": "uuid",
   *   "fileSize": 1048576
   * }
   */
  @Post()
  async create(@Body() dto: CreateBookCopyDto): Promise<BookCopyDto> {
    try {
      const bookCopy = await this.createBookCopyUseCase.execute(dto);
      return BookCopyDto.fromEntity(bookCopy, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建失败';
      throw new BadRequestException(message);
    }
  }

  /**
   * 获取图书载体列表（支持分页和过滤）
   * GET /api/v1/book-copies?page=1&pageSize=20&bookId=xxx&type=PHYSICAL&status=AVAILABLE
   */
  @Get()
  async findAll(
    @Query() query: QueryBookCopiesDto,
  ): Promise<PaginatedBookCopiesDto> {
    const result = await this.getBookCopiesUseCase.execute(query);

    const response = new PaginatedBookCopiesDto();
    response.items = result.items.map((bc) => BookCopyDto.fromEntity(bc, true));
    response.total = result.total;
    response.page = query.page || 1;
    response.pageSize = query.pageSize || 20;
    response.totalPages = Math.ceil(result.total / response.pageSize);

    return response;
  }

  /**
   * 获取图书载体详情
   * GET /api/v1/book-copies/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookCopyDto> {
    try {
      const bookCopy = await this.getBookCopyByIdUseCase.execute(id);
      return BookCopyDto.fromEntity(bookCopy, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '未找到';
      throw new NotFoundException(message);
    }
  }

  /**
   * 更新图书载体
   * PUT /api/v1/book-copies/:id
   *
   * 示例请求体（纸质书更新库存）:
   * {
   *   "totalCopies": 15,
   *   "location": "B区-002架"
   * }
   *
   * 示例请求体（更新状态）:
   * {
   *   "status": "MAINTENANCE"
   * }
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookCopyDto,
  ): Promise<BookCopyDto> {
    try {
      const bookCopy = await this.updateBookCopyUseCase.execute(id, dto);
      return BookCopyDto.fromEntity(bookCopy, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新失败';
      throw new BadRequestException(message);
    }
  }

  /**
   * 删除图书载体
   * DELETE /api/v1/book-copies/:id
   *
   * 注意：如果有活跃借阅记录则无法删除
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.deleteBookCopyUseCase.execute(id);
      return { message: '删除成功' };
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败';
      throw new BadRequestException(message);
    }
  }
}

/**
 * 图书相关的载体管理控制器
 *
 * 路由: /api/v1/books/:bookId/copies
 *
 * 这是一个嵌套路由，方便前端根据图书ID获取其所有载体
 * 权限说明: 见下方各接口注释
 */
/**
 * 权限: 仅管理员
 */
@Controller('books/:bookId/copies')
@Roles(UserRole.ADMIN)
export class BookCopiesOfBookController {
  constructor(
    private readonly getBookCopiesByBookIdUseCase: GetBookCopiesByBookIdUseCase,
  ) {}

  /**
   * 获取指定图书的所有载体
   * GET /api/v1/books/:bookId/copies
   *
   * 示例：GET /api/v1/books/123e4567-e89b-12d3-a456-426614174000/copies
   * 返回该图书的所有纸质版和电子版载体
   */
  @Get()
  async getCopiesByBookId(
    @Param('bookId') bookId: string,
  ): Promise<BookCopyDto[]> {
    const bookCopies = await this.getBookCopiesByBookIdUseCase.execute(bookId);
    return bookCopies.map((bc) => BookCopyDto.fromEntity(bc, true));
  }

  /**
   * 获取指定图书的载体统计
   * GET /api/v1/books/:bookId/copies/stats
   *
   * 返回纸质书和电子书数量统计
   * TODO: 需要实现统计功能
   */
  @Get('stats')
  async getStats(): Promise<BookCopyStatsDto> {
    // 暂时返回空统计,需要实现具体逻辑
    const dto = new BookCopyStatsDto();
    dto.physical = 0;
    dto.ebook = 0;
    dto.total = 0;
    return dto;
  }
}
