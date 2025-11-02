/**
 * Category 实体 - 图书分类
 *
 * 职责:
 * - 封装分类核心属性
 * - 提供分类业务逻辑
 */
export class Category {
  id: string;
  name: string;
  parentId: string | null;
  sort: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    parentId?: string | null;
    sort?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.parentId = props.parentId ?? null;
    this.sort = props.sort ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * 更新分类名称
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('分类名称不能为空');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  /**
   * 更新排序
   */
  updateSort(sort: number): void {
    if (sort < 0) {
      throw new Error('排序值不能为负数');
    }
    this.sort = sort;
    this.updatedAt = new Date();
  }

  /**
   * 更新父分类
   */
  updateParent(parentId: string | null): void {
    if (parentId === this.id) {
      throw new Error('不能将自己设为父分类');
    }
    this.parentId = parentId;
    this.updatedAt = new Date();
  }

  /**
   * 是否为根分类
   */
  isRoot(): boolean {
    return this.parentId === null;
  }
}
