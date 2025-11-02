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
  UseGuards,
  Request,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { UserRole } from '@repo/types';
import { CreateReaderUseCase } from '../../application/use-cases/create-reader.use-case';
import { UpdateReaderUseCase } from '../../application/use-cases/update-reader.use-case';
import { DeleteReaderUseCase } from '../../application/use-cases/delete-reader.use-case';
import { GetReadersUseCase } from '../../application/use-cases/get-readers.use-case';
import { GetReaderStatisticsUseCase } from '../../application/use-cases/get-reader-statistics.use-case';
import {
  CreateReaderDto,
  UpdateReaderDto,
  QueryReadersDto,
  ReaderDto,
  PaginatedReadersDto,
  ReaderStatisticsDto,
} from '../../application/dto/reader.dto';
import { IReaderRepository, READER_REPOSITORY } from '../../domain/repositories/reader-repository.interface';
import { Inject } from '@nestjs/common';

/**
 * 读者管理控制器
 *
 * 路由: /api/v1/readers
 */
@Controller('readers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReaderController {
  constructor(
    private readonly createReaderUseCase: CreateReaderUseCase,
    private readonly updateReaderUseCase: UpdateReaderUseCase,
    private readonly deleteReaderUseCase: DeleteReaderUseCase,
    private readonly getReadersUseCase: GetReadersUseCase,
    private readonly getReaderStatisticsUseCase: GetReaderStatisticsUseCase,
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
  ) {}

  /**
   * 创建读者
   * POST /api/v1/readers
   * 权限: 仅管理员
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateReaderDto): Promise<ReaderDto> {
    const reader = await this.createReaderUseCase.execute(dto);
    return ReaderDto.fromEntity(reader);
  }

  /**
   * 获取读者列表 (支持分页和搜索)
   * GET /api/v1/readers?page=1&pageSize=20&status=ACTIVE&keyword=xxx
   * 权限: 仅管理员
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: QueryReadersDto): Promise<PaginatedReadersDto> {
    const result = await this.getReadersUseCase.execute(query);

    const response = new PaginatedReadersDto();
    response.items = result.items.map((reader) => ReaderDto.fromEntity(reader));
    response.total = result.total;
    response.page = result.page;
    response.pageSize = result.pageSize;
    response.totalPages = Math.ceil(result.total / result.pageSize);

    return response;
  }

  /**
   * 获取读者详情
   * GET /api/v1/readers/:id
   * 权限: 管理员可查看所有读者，读者只能查看自己
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.READER)
  async findOne(@Param('id') id: string, @Request() req): Promise<ReaderDto> {
    const reader = await this.readerRepository.findById(id);
    if (!reader) {
      throw new NotFoundException(`读者不存在: ${id}`);
    }

    // 读者只能查看自己的信息
    if (req.user.role === UserRole.READER) {
      const currentUserReader = await this.readerRepository.findByUserId(req.user.sub);
      if (!currentUserReader || currentUserReader.id !== id) {
        throw new ForbiddenException('您只能查看自己的读者信息');
      }
    }

    return ReaderDto.fromEntity(reader);
  }

  /**
   * 根据学号查找读者
   * GET /api/v1/readers/student/:studentId
   * 权限: 仅管理员
   */
  @Get('student/:studentId')
  @Roles(UserRole.ADMIN)
  async findByStudentId(@Param('studentId') studentId: string): Promise<ReaderDto> {
    const reader = await this.readerRepository.findByStudentId(studentId);
    if (!reader) {
      throw new NotFoundException(`学号不存在: ${studentId}`);
    }

    return ReaderDto.fromEntity(reader);
  }

  /**
   * 获取读者统计信息
   * GET /api/v1/readers/:id/statistics
   * 权限: 管理员可查看所有读者，读者只能查看自己
   */
  @Get(':id/statistics')
  @Roles(UserRole.ADMIN, UserRole.READER)
  async getStatistics(@Param('id') id: string, @Request() req): Promise<ReaderStatisticsDto> {
    // 权限校验：读者只能查看自己的统计
    if (req.user.role === UserRole.READER) {
      const currentUserReader = await this.readerRepository.findByUserId(req.user.sub);
      if (!currentUserReader || currentUserReader.id !== id) {
        throw new ForbiddenException('您只能查看自己的统计信息');
      }
    }

    return await this.getReaderStatisticsUseCase.execute(id);
  }

  /**
   * 更新读者
   * PUT /api/v1/readers/:id
   * 权限: 仅管理员
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReaderDto,
  ): Promise<ReaderDto> {
    const reader = await this.updateReaderUseCase.execute(id, dto);
    return ReaderDto.fromEntity(reader);
  }

  /**
   * 激活读者
   * POST /api/v1/readers/:id/activate
   * 权限: 仅管理员
   */
  @Post(':id/activate')
  @Roles(UserRole.ADMIN)
  async activate(@Param('id') id: string): Promise<ReaderDto> {
    const reader = await this.readerRepository.findById(id);
    if (!reader) {
      throw new NotFoundException(`读者不存在: ${id}`);
    }

    reader.activate();
    const updated = await this.readerRepository.save(reader);
    return ReaderDto.fromEntity(updated);
  }

  /**
   * 禁用读者
   * POST /api/v1/readers/:id/deactivate
   * 权限: 仅管理员
   */
  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id') id: string): Promise<ReaderDto> {
    const reader = await this.readerRepository.findById(id);
    if (!reader) {
      throw new NotFoundException(`读者不存在: ${id}`);
    }

    reader.deactivate();
    const updated = await this.readerRepository.save(reader);
    return ReaderDto.fromEntity(updated);
  }

  /**
   * 删除读者
   * DELETE /api/v1/readers/:id
   * 权限: 仅管理员
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.deleteReaderUseCase.execute(id);
    return { message: '读者删除成功' };
  }
}
