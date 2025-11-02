import { Category } from '../entities/category.entity';

/**
 * 分类仓储接口
 *
 * 定义分类数据访问契约
 */
export interface ICategoryRepository {
  /**
   * 保存分类
   */
  save(category: Category): Promise<Category>;

  /**
   * 根据ID查找分类
   */
  findById(id: string): Promise<Category | null>;

  /**
   * 查找所有分类
   */
  findAll(): Promise<Category[]>;

  /**
   * 根据父ID查找子分类
   */
  findByParentId(parentId: string | null): Promise<Category[]>;

  /**
   * 删除分类
   */
  delete(id: string): Promise<void>;

  /**
   * 检查分类名称是否已存在
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * 检查分类是否有子分类
   */
  hasChildren(id: string): Promise<boolean>;
}

export const CATEGORY_REPOSITORY = 'ICategoryRepository';
