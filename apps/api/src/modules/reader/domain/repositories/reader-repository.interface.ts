import { Reader } from '../entities/reader.entity';

/**
 * 读者仓储接口的 DI Token
 */
export const READER_REPOSITORY = 'READER_REPOSITORY';

/**
 * 读者仓储接口
 * 定义读者领域模型的持久化操作
 */
export interface IReaderRepository {
  /**
   * 保存读者（创建或更新）
   */
  save(reader: Reader): Promise<Reader>;

  /**
   * 根据 ID 查找读者
   */
  findById(id: string): Promise<Reader | null>;

  /**
   * 根据用户 ID 查找读者
   */
  findByUserId(userId: string): Promise<Reader | null>;

  /**
   * 根据学号查找读者
   */
  findByStudentId(studentId: string): Promise<Reader | null>;

  /**
   * 查找所有读者（分页）
   */
  findAll(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<{
    items: Reader[];
    total: number;
    page: number;
    pageSize: number;
  }>;

  /**
   * 删除读者
   */
  delete(id: string): Promise<void>;

  /**
   * 检查读者是否存在（根据用户 ID）
   */
  existsByUserId(userId: string): Promise<boolean>;

  /**
   * 检查学号是否已被使用
   */
  existsByStudentId(studentId: string, excludeId?: string): Promise<boolean>;

  /**
   * 统计读者数量
   */
  count(params?: { status?: 'ACTIVE' | 'INACTIVE' }): Promise<number>;
}
