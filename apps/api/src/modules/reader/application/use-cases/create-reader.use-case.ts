import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IReaderRepository, READER_REPOSITORY } from '../../domain/repositories/reader-repository.interface';
import { Reader } from '../../domain/entities/reader.entity';
import { CreateReaderDto } from '../dto/reader.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * 创建读者用例
 *
 * 业务规则：
 * 1. userId 必须唯一（一个用户只能对应一个读者）
 * 2. studentId 如果提供，必须唯一
 * 3. 用户必须存在且角色为 READER
 */
@Injectable()
export class CreateReaderUseCase {
  constructor(
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateReaderDto): Promise<Reader> {
    // 1. 验证用户是否存在且角色为 READER
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`用户不存在: ${dto.userId}`);
    }

    if (user.role !== 'READER') {
      throw new ConflictException('该用户不是读者角色，无法创建读者信息');
    }

    // 2. 验证 userId 唯一性（一个用户只能有一个读者记录）
    const existsByUserId = await this.readerRepository.existsByUserId(dto.userId);
    if (existsByUserId) {
      throw new ConflictException(`该用户已有读者信息: ${dto.userId}`);
    }

    // 3. 验证 studentId 唯一性（如果提供）
    if (dto.studentId) {
      const existsByStudentId = await this.readerRepository.existsByStudentId(dto.studentId);
      if (existsByStudentId) {
        throw new ConflictException(`学号已存在: ${dto.studentId}`);
      }
    }

    // 4. 创建读者实体
    const reader = new Reader({
      id: uuidv4(),
      userId: dto.userId,
      name: dto.name,
      studentId: dto.studentId || null,
      phone: dto.phone || null,
      email: dto.email || null,
      status: 'ACTIVE', // 默认激活
      maxBorrowLimit: dto.maxBorrowLimit ?? 5, // 默认最多借 5 本
    });

    // 5. 保存读者
    return await this.readerRepository.save(reader);
  }
}
