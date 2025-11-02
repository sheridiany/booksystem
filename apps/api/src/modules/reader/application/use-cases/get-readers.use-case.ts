import { Injectable, Inject } from '@nestjs/common';
import { IReaderRepository, READER_REPOSITORY } from '../../domain/repositories/reader-repository.interface';
import { Reader } from '../../domain/entities/reader.entity';
import { QueryReadersDto } from '../dto/reader.dto';

/**
 * 查询读者列表用例
 */
@Injectable()
export class GetReadersUseCase {
  constructor(
    @Inject(READER_REPOSITORY)
    private readonly readerRepository: IReaderRepository,
  ) {}

  async execute(query: QueryReadersDto): Promise<{
    items: Reader[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return await this.readerRepository.findAll({
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      keyword: query.keyword,
      status: query.status,
    });
  }
}
