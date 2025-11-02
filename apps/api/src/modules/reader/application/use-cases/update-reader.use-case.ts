import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { IReaderRepository, READER_REPOSITORY } from '../../domain/repositories/reader-repository.interface';
import { Reader } from '../../domain/entities/reader.entity';
import { UpdateReaderDto } from '../dto/reader.dto';

/**
 * 更新读者用例
 *
 * 业务规则：
 * 1. 读者必须存在
 * 2. studentId 如果修改，新值必须唯一
 */
@Injectable()
export class UpdateReaderUseCase {
  constructor(
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
  ) {}

  async execute(id: string, dto: UpdateReaderDto): Promise<Reader> {
    // 1. 加载读者实体
    const reader = await this.readerRepository.findById(id);
    if (!reader) {
      throw new NotFoundException(`读者不存在: ${id}`);
    }

    // 2. 验证 studentId 唯一性（如果修改）
    if (dto.studentId !== undefined && dto.studentId !== reader.studentId) {
      const studentIdToCheck = dto.studentId || '';
      if (studentIdToCheck && (await this.readerRepository.existsByStudentId(studentIdToCheck, id))) {
        throw new ConflictException(`学号已存在: ${dto.studentId}`);
      }
    }

    // 3. 更新读者信息
    reader.updateInfo({
      name: dto.name,
      studentId: dto.studentId,
      phone: dto.phone,
      email: dto.email,
      maxBorrowLimit: dto.maxBorrowLimit,
    });

    // 4. 保存读者
    return await this.readerRepository.save(reader);
  }
}
