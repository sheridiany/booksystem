import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IReaderRepository } from '../../domain/repositories/reader-repository.interface';
import { Reader } from '../../domain/entities/reader.entity';

/**
 * 读者仓储实现 (Prisma)
 */
@Injectable()
export class ReaderRepository implements IReaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(reader: Reader): Promise<Reader> {
    const data = {
      id: reader.id,
      userId: reader.userId,
      name: reader.name,
      studentId: reader.studentId,
      phone: reader.phone,
      email: reader.email,
      status: reader.status,
      maxBorrowLimit: reader.maxBorrowLimit,
      createdAt: reader.createdAt,
      updatedAt: reader.updatedAt,
    };

    // openGauss 不支持 upsert, 使用 findUnique + create/update
    const existing = await this.prisma.reader.findUnique({
      where: { id: reader.id },
    });

    const saved = existing
      ? await this.prisma.reader.update({
          where: { id: reader.id },
          data,
        })
      : await this.prisma.reader.create({ data });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Reader | null> {
    const reader = await this.prisma.reader.findUnique({
      where: { id },
    });

    return reader ? this.toDomain(reader) : null;
  }

  async findByUserId(userId: string): Promise<Reader | null> {
    const reader = await this.prisma.reader.findUnique({
      where: { userId },
    });

    return reader ? this.toDomain(reader) : null;
  }

  async findByStudentId(studentId: string): Promise<Reader | null> {
    const reader = await this.prisma.reader.findFirst({
      where: { studentId },
    });

    return reader ? this.toDomain(reader) : null;
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<{
    items: Reader[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.keyword) {
      where.OR = [
        { name: { contains: params.keyword } },
        { studentId: { contains: params.keyword } },
        { phone: { contains: params.keyword } },
        { email: { contains: params.keyword } },
      ];
    }

    // 查询总数和数据
    const [total, readers] = await Promise.all([
      this.prisma.reader.count({ where }),
      this.prisma.reader.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ createdAt: 'desc' }],
      }),
    ]);

    return {
      items: readers.map((r) => this.toDomain(r)),
      total,
      page,
      pageSize,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reader.delete({
      where: { id },
    });
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.prisma.reader.count({
      where: { userId },
    });

    return count > 0;
  }

  async existsByStudentId(studentId: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.reader.count({
      where: {
        studentId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return count > 0;
  }

  async count(params?: { status?: 'ACTIVE' | 'INACTIVE' }): Promise<number> {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    return await this.prisma.reader.count({ where });
  }

  /**
   * Prisma 模型转领域实体
   */
  private toDomain(prismaReader: any): Reader {
    return new Reader({
      id: prismaReader.id,
      userId: prismaReader.userId,
      name: prismaReader.name,
      studentId: prismaReader.studentId,
      phone: prismaReader.phone,
      email: prismaReader.email,
      status: prismaReader.status,
      maxBorrowLimit: prismaReader.maxBorrowLimit,
      createdAt: prismaReader.createdAt,
      updatedAt: prismaReader.updatedAt,
    });
  }
}
