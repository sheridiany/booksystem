import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@repo/types';
import { BorrowBookUseCase } from '../../application/use-cases/borrow-book.use-case';
import { ReturnBookUseCase } from '../../application/use-cases/return-book.use-case';
import { RenewBorrowUseCase } from '../../application/use-cases/renew-borrow.use-case';
import { GetBorrowsUseCase } from '../../application/use-cases/get-borrows.use-case';
import { CheckOverdueUseCase } from '../../application/use-cases/check-overdue.use-case';
import {
  BorrowBookDto,
  RenewBorrowDto,
  QueryBorrowsDto,
  BorrowDto,
  PaginatedBorrowsDto,
} from '../../application/dto/borrow.dto';
import { IReaderRepository, READER_REPOSITORY } from '@/modules/reader/domain/repositories/reader-repository.interface';
import { Inject } from '@nestjs/common';

/**
 * 借阅管理控制器
 *
 * 路由: /api/v1/borrows
 */
@Controller('borrows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BorrowController {
  constructor(
    private readonly borrowBookUseCase: BorrowBookUseCase,
    private readonly returnBookUseCase: ReturnBookUseCase,
    private readonly renewBorrowUseCase: RenewBorrowUseCase,
    private readonly getBorrowsUseCase: GetBorrowsUseCase,
    private readonly checkOverdueUseCase: CheckOverdueUseCase,
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
  ) {}

  /**
   * 办理借阅
   * POST /api/v1/borrows
   * 权限: 仅管理员
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async borrow(@Body() dto: BorrowBookDto): Promise<BorrowDto> {
    const borrowRecord = await this.borrowBookUseCase.execute(dto);
    return BorrowDto.fromEntity(borrowRecord, true);
  }

  /**
   * 办理归还
   * POST /api/v1/borrows/:id/return
   * 权限: 仅管理员
   */
  @Post(':id/return')
  @Roles(UserRole.ADMIN)
  async return(@Param('id') id: string): Promise<BorrowDto> {
    const borrowRecord = await this.returnBookUseCase.execute(id);
    return BorrowDto.fromEntity(borrowRecord, true);
  }

  /**
   * 办理续借
   * POST /api/v1/borrows/:id/renew
   * 权限: 管理员或读者本人
   */
  @Post(':id/renew')
  @Roles(UserRole.ADMIN, UserRole.READER)
  async renew(
    @Param('id') id: string,
    @Body() dto: RenewBorrowDto,
    @Request() req,
  ): Promise<BorrowDto> {
    // 如果是读者，验证是否是本人的借阅记录
    if (req.user.role === UserRole.READER) {
      const borrowRecord = await this.getBorrowsUseCase.getById(id);
      if (!borrowRecord) {
        throw new NotFoundException(`借阅记录不存在: ${id}`);
      }

      const currentUserReader = await this.readerRepository.findByUserId(req.user.sub);
      if (!currentUserReader || currentUserReader.id !== borrowRecord.readerId) {
        throw new ForbiddenException('您只能续借自己的图书');
      }
    }

    const borrowRecord = await this.renewBorrowUseCase.execute(id, dto);
    return BorrowDto.fromEntity(borrowRecord, true);
  }

  /**
   * 获取借阅记录列表（支持分页和筛选）
   * GET /api/v1/borrows?page=1&pageSize=20&readerId=xxx&status=BORROWED
   * 权限: 管理员可查看所有记录，读者只能查看自己的记录
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.READER)
  async findAll(@Query() query: QueryBorrowsDto, @Request() req): Promise<PaginatedBorrowsDto> {
    // 如果是读者，自动筛选为该读者的记录
    if (req.user.role === UserRole.READER) {
      const currentUserReader = await this.readerRepository.findByUserId(req.user.sub);
      if (currentUserReader) {
        query.readerId = currentUserReader.id;
      } else {
        // 该用户没有读者信息，返回空结果
        return {
          items: [],
          total: 0,
          page: query.page || 1,
          pageSize: query.pageSize || 20,
          totalPages: 0,
        };
      }
    }

    const result = await this.getBorrowsUseCase.execute(query);

    const response = new PaginatedBorrowsDto();
    response.items = result.items.map((record) => BorrowDto.fromEntity(record, true));
    response.total = result.total;
    response.page = result.page;
    response.pageSize = result.pageSize;
    response.totalPages = Math.ceil(result.total / result.pageSize);

    return response;
  }

  /**
   * 获取借阅记录详情
   * GET /api/v1/borrows/:id
   * 权限: 管理员可查看所有记录，读者只能查看自己的记录
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.READER)
  async findOne(@Param('id') id: string, @Request() req): Promise<BorrowDto> {
    const borrowRecord = await this.getBorrowsUseCase.getById(id);
    if (!borrowRecord) {
      throw new NotFoundException(`借阅记录不存在: ${id}`);
    }

    // 如果是读者，验证是否是本人的记录
    if (req.user.role === UserRole.READER) {
      const currentUserReader = await this.readerRepository.findByUserId(req.user.sub);
      if (!currentUserReader || currentUserReader.id !== borrowRecord.readerId) {
        throw new ForbiddenException('您只能查看自己的借阅记录');
      }
    }

    return BorrowDto.fromEntity(borrowRecord, true);
  }

  /**
   * 获取逾期记录
   * GET /api/v1/borrows/overdue/list
   * 权限: 仅管理员
   */
  @Get('overdue/list')
  @Roles(UserRole.ADMIN)
  async getOverdue(@Query('limit') limit?: string): Promise<BorrowDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const records = await this.getBorrowsUseCase.getOverdue(limitNum);
    return records.map((record) => BorrowDto.fromEntity(record, true));
  }

  /**
   * 检查并更新逾期状态（定时任务接口）
   * POST /api/v1/borrows/check-overdue
   * 权限: 仅管理员
   */
  @Post('check-overdue')
  @Roles(UserRole.ADMIN)
  async checkOverdue(): Promise<{ updatedCount: number }> {
    const updatedCount = await this.checkOverdueUseCase.execute();
    return { updatedCount };
  }

  /**
   * 获取读者的借阅记录
   * GET /api/v1/borrows/reader/:readerId
   * 权限: 管理员可查看所有读者，读者只能查看自己
   */
  @Get('reader/:readerId')
  @Roles(UserRole.ADMIN, UserRole.READER)
  async getByReader(@Param('readerId') readerId: string, @Request() req): Promise<BorrowDto[]> {
    // 如果是读者，验证是否查询本人
    if (req.user.role === UserRole.READER) {
      const currentUserReader = await this.readerRepository.findByUserId(req.user.sub);
      if (!currentUserReader || currentUserReader.id !== readerId) {
        throw new ForbiddenException('您只能查看自己的借阅记录');
      }
    }

    const records = await this.getBorrowsUseCase.getByReader(readerId);
    return records.map((record) => BorrowDto.fromEntity(record, true));
  }

  /**
   * 获取图书的借阅记录
   * GET /api/v1/borrows/book/:bookId
   * 权限: 仅管理员
   */
  @Get('book/:bookId')
  @Roles(UserRole.ADMIN)
  async getByBook(@Param('bookId') bookId: string): Promise<BorrowDto[]> {
    const records = await this.getBorrowsUseCase.getByBook(bookId);
    return records.map((record) => BorrowDto.fromEntity(record, true));
  }
}
