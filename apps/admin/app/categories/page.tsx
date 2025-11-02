'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Plus, Edit, Trash2, FolderTree, Loader2, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { CategoryDialog } from '@/components/categories/category-dialog';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/hooks/use-categories';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/lib/api/category.api';

export default function CategoriesPage() {
  // 数据获取
  const { data: categories = [], isLoading, error } = useCategories();

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // 本地状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // 切换折叠状态
  const toggleCollapse = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  // 检查分类是否应该显示（考虑折叠状态）
  const isCategoryVisible = (category: Category): boolean => {
    if (!category.parentId) return true; // 顶级分类始终可见

    // 检查所有父级是否都未折叠
    let parent = categories.find(c => c.id === category.parentId);
    while (parent) {
      if (collapsedCategories.has(parent.id)) return false;
      parent = categories.find(c => c.id === parent!.parentId);
    }
    return true;
  };

  // 检查分类是否有子分类
  const hasChildren = (categoryId: string): boolean => {
    return categories.some(cat => cat.parentId === categoryId);
  };

  // 打开添加对话框
  const handleAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  // 保存分类（添加或编辑）
  const handleSave = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCategory) {
        // 编辑模式
        const updateDto: UpdateCategoryDto = {
          name: categoryData.name,
          parentId: categoryData.parentId,
          sort: categoryData.sort,
        };
        await updateMutation.mutateAsync({ id: editingCategory.id, data: updateDto });
      } else {
        // 添加模式
        const createDto: CreateCategoryDto = {
          name: categoryData.name,
          parentId: categoryData.parentId,
          sort: categoryData.sort,
        };
        await createMutation.mutateAsync(createDto);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('保存分类失败:', error);
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    // 检查是否有子分类
    const hasChildren = categories.some((cat) => cat.parentId === id);
    if (hasChildren) {
      alert('该分类下还有子分类，无法删除！请先删除或移动子分类。');
      setDeleteConfirm(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('删除分类失败:', error);
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setDeleteConfirm(null);
    }
  };

  // 过滤分类
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 构建树形结构并排序
  const buildCategoryTree = (parentId: string | null = null): Category[] => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .flatMap((cat) => [cat, ...buildCategoryTree(cat.id)]);
  };

  // 获取排序后的分类列表（树形顺序）
  const sortedCategories = buildCategoryTree();

  // 应用搜索过滤和折叠状态
  const displayCategories = searchQuery
    ? filteredCategories // 搜索时显示所有匹配的
    : sortedCategories.filter(isCategoryVisible); // 正常模式下应用折叠

  // 获取分类层级
  const getCategoryLevel = (categoryId: string): number => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !category.parentId) return 0;
    return 1 + getCategoryLevel(category.parentId);
  };

  // 加载状态
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">加载分类数据中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 错误状态
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="text-lg font-semibold">加载失败</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : '无法加载分类数据'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">图书分类管理</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              管理图书分类信息，支持层级分类
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加分类
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索分类名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* 分类列表 */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    分类名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    父分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    图书数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayCategories.map((category) => {
                  const parent = categories.find(c => c.id === category.parentId);
                  const level = getCategoryLevel(category.id);
                  const isTopLevel = level === 0;
                  const isDeleting = deleteConfirm === category.id;
                  const categoryHasChildren = hasChildren(category.id);
                  const isCollapsed = collapsedCategories.has(category.id);

                  return (
                    <tr key={category.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
                          {/* 折叠/展开按钮 */}
                          {categoryHasChildren ? (
                            <button
                              onClick={() => toggleCollapse(category.id)}
                              className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-accent transition-colors"
                              title={isCollapsed ? '展开' : '折叠'}
                            >
                              {isCollapsed ? (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          ) : (
                            <span className="w-5" /> // 占位,保持对齐
                          )}

                          {level > 0 && (
                            <span className="text-muted-foreground text-xs">
                              {'└' + '─'.repeat(level)}
                            </span>
                          )}
                          <FolderTree className={`h-4 w-4 ${isTopLevel ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm ${isTopLevel ? 'font-semibold' : ''}`}>
                            {category.name}
                          </span>
                          {categoryHasChildren && (
                            <span className="text-xs text-muted-foreground">
                              ({categories.filter(c => c.parentId === category.id).length})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {parent ? parent.name : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                          {category.bookCount} 本
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {category.sort}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isDeleting ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">确定删除？</span>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              确定
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              编辑
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(category.id)}
                              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              删除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 空状态 */}
          {displayCategories.length === 0 && (
            <div className="text-center py-12">
              <FolderTree className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {searchQuery ? '未找到匹配的分类' : '暂无分类'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? '尝试使用其他关键词搜索'
                  : '点击"添加分类"按钮创建第一个分类'}
              </p>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-sm text-muted-foreground">总分类数</div>
            <div className="text-2xl font-bold mt-1">{categories.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-sm text-muted-foreground">顶级分类</div>
            <div className="text-2xl font-bold mt-1">
              {categories.filter(c => !c.parentId).length}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="text-sm text-muted-foreground">总图书数</div>
            <div className="text-2xl font-bold mt-1">
              {categories.reduce((sum, c) => sum + (c.bookCount || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 分类对话框 */}
      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        category={editingCategory}
        categories={categories}
      />
    </DashboardLayout>
  );
}
