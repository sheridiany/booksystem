import {
  Controller,
  Get,
  Post,
  Patch,
  // Delete, // TODO: 添加删除图书接口
  Body,
  Param,
  Query,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBookUseCase } from '../../application/use-cases/create-book.use-case';
import { UpdateBookUseCase } from '../../application/use-cases/update-book.use-case';
// import { DeleteBookUseCase } from '../../application/use-cases/delete-book.use-case'; // TODO: 添加删除接口时取消注释
import { GetBooksUseCase } from '../../application/use-cases/get-books.use-case';
import {
  CreateBookDto,
  UpdateBookDto,
  QueryBooksDto,
  BookDto,
  PaginatedBooksDto,
} from '../../application/dto/book.dto';
import { Public } from '../../../../shared/decorators/public.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/entities/user.entity';
import { UploadFileUseCase } from '../../../file/application/use-cases/upload-file.use-case';

/**
 * 图书管理控制器
 *
 * 路由: /api/v1/books
 *
 * 权限说明:
 * - 查询接口: 公开访问（读者端需要）
 * - 管理接口: 仅管理员
 */
@Controller('books')
export class BookController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    // private readonly deleteBookUseCase: DeleteBookUseCase, // TODO: 添加删除接口时取消注释
    private readonly getBooksUseCase: GetBooksUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
  ) {}

  /**
   * 创建图书
   * POST /api/v1/books
   * 权限: 仅管理员
   */
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateBookDto): Promise<BookDto> {
    const book = await this.createBookUseCase.execute(dto);
    return BookDto.fromEntity(book);
  }

  /**
   * 获取图书列表 (支持分页和搜索)
   * GET /api/v1/books?page=1&pageSize=20&categoryId=xxx&search=xxx
   * 权限: 公开访问
   */
  @Public()
  @Get()
  async findAll(@Query() query: QueryBooksDto): Promise<PaginatedBooksDto> {
    const result = await this.getBooksUseCase.execute(query);

    const response = new PaginatedBooksDto();
    response.items = result.items.map((book) => BookDto.fromEntity(book));
    response.total = result.total;
    response.page = result.page;
    response.pageSize = result.pageSize;
    response.totalPages = Math.ceil(result.total / result.pageSize);

    return response;
  }

  /**
   * 获取热门图书
   * GET /api/v1/books/popular/list
   * 注意: 必须在 :id 路由之前,避免被参数路由拦截
   * 权限: 公开访问
   */
  @Public()
  @Get('popular/list')
  async getPopular(@Query('limit') limit?: string): Promise<BookDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const books = await this.getBooksUseCase.getPopular(limitNum);
    return books.map((book) => BookDto.fromEntity(book));
  }

  /**
   * 根据分类获取图书
   * GET /api/v1/books/category/:categoryId
   * 注意: 必须在 :id 路由之前,避免被参数路由拦截
   * 权限: 公开访问
   */
  @Public()
  @Get('category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: string): Promise<BookDto[]> {
    const books = await this.getBooksUseCase.getByCategory(categoryId);
    return books.map((book) => BookDto.fromEntity(book));
  }

  /**
   * 获取图书详情
   * GET /api/v1/books/:id
   * 注意: 必须在所有具体路由之后,作为兜底路由
   * 权限: 公开访问
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookDto> {
    const book = await this.getBooksUseCase.getById(id);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${id}`);
    }

    return BookDto.fromEntity(book);
  }

  /**
   * 更新图书
   * PATCH /api/v1/books/:id
   * 权限: 仅管理员
   */
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ): Promise<BookDto> {
    const book = await this.updateBookUseCase.execute(id, dto);
    return BookDto.fromEntity(book);
  }

  /**
   * 上传图书封面
   * POST /api/v1/books/:id/cover
   * 注意: 必须在 PATCH :id 路由之后
   * 权限: 仅管理员
   */
  @Roles(UserRole.ADMIN)
  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ fileId: string }> {
    if (!file) {
      throw new BadRequestException('请上传封面图片');
    }

    // 验证图书是否存在
    const book = await this.getBooksUseCase.getById(id);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${id}`);
    }

    // 上传文件
    const result = await this.uploadFileUseCase.execute({
      file,
      uploadedBy: 'admin-user-id', // TODO: 从 JWT 获取
    });

    // 更新图书封面 ID
    await this.updateBookUseCase.execute(id, {
      coverFileId: result.id,
    });

    return { fileId: result.id };
  }

  /**
   * 上传图书内容文件（电子书）
   * POST /api/v1/books/:id/content
   * 权限: 仅管理员
   */
  @Roles(UserRole.ADMIN)
  @Post(':id/content')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadContent(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ fileId: string }> {
    if (!file) {
      throw new BadRequestException('请上传电子书文件');
    }

    // 验证图书是否存在
    const book = await this.getBooksUseCase.getById(id);
    if (!book) {
      throw new NotFoundException(`图书不存在: ${id}`);
    }

    // 上传文件
    const result = await this.uploadFileUseCase.execute({
      file,
      uploadedBy: 'admin-user-id', // TODO: 从 JWT 获取
    });

    return { fileId: result.id };
  }
}
