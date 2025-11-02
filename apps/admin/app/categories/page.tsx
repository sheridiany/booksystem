'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Plus, Loader2, AlertCircle, Trash2, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { CategoryDialog } from '@/components/categories/category-dialog';
import { CategoryTable } from '@/components/categories/category-table';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useBatchDeleteCategories,
  useBatchMoveCategories,
} from '@/lib/hooks/use-categories';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/lib/api/category.api';
import { toast } from 'sonner';

export default function CategoriesPage() {
  // 数据获取
  const { data: categories = [], isLoading, error } = useCategories();

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const batchDeleteMutation = useBatchDeleteCategories();
  const batchMoveMutation = useBatchMoveCategories();

  // 本地状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

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
    if (!category.parentId) return true;

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

  // 保存分类
  const handleSave = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCategory) {
        const updateDto: UpdateCategoryDto = {
          name: categoryData.name,
          parentId: categoryData.parentId,
          sort: categoryData.sort,
        };
        await updateMutation.mutateAsync({ id: editingCategory.id, data: updateDto });
        toast.success('分类更新成功！');
      } else {
        const createDto: CreateCategoryDto = {
          name: categoryData.name,
          parentId: categoryData.parentId,
          sort: categoryData.sort,
        };
        await createMutation.mutateAsync(createDto);
        toast.success('分类创建成功！');
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('保存分类失败:', error);
      toast.error(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    const hasChildrenCheck = categories.some((cat) => cat.parentId === id);
    if (hasChildrenCheck) {
      toast.warning('该分类下还有子分类，无法删除！请先删除或移动子分类。');
      setDeleteConfirm(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('分类删除成功！');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('删除分类失败:', error);
      toast.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setDeleteConfirm(null);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedCategories.length === 0) return;

    // 检查是否有子分类
    const hasChildrenCategories = selectedCategories.filter((id) =>
      categories.some((cat) => cat.parentId === id)
    );

    if (hasChildrenCategories.length > 0) {
      const categoryNames = hasChildrenCategories.map((id) => categories.find((c) => c.id === id)?.name).join(', ');
      toast.warning(`以下分类有子分类，无法删除：${categoryNames}`);
      return;
    }

    if (!confirm(`确定要删除 ${selectedCategories.length} 个分类吗？`)) return;

    try {
      await batchDeleteMutation.mutateAsync(selectedCategories);
      setSelectedCategories([]);
      toast.success(`成功删除 ${selectedCategories.length} 个分类！`);
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error(`批量删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 批量移动
  const handleBatchMove = async (targetParentId: string | null) => {
    if (selectedCategories.length === 0) return;

    try {
      await batchMoveMutation.mutateAsync({ ids: selectedCategories, targetParentId });
      setSelectedCategories([]);
      setIsMoveDialogOpen(false);
      toast.success(`成功移动 ${selectedCategories.length} 个分类！`);
    } catch (error) {
      console.error('批量移动失败:', error);
      toast.error(`批量移动失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 过滤分类（添加安全检查）
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat) =>
        cat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // 构建树形结构并排序
  const buildCategoryTree = (parentId: string | null = null): Category[] => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .flatMap((cat) => [cat, ...buildCategoryTree(cat.id)]);
  };

  const sortedCategories = buildCategoryTree();
  const displayCategories = searchQuery
    ? filteredCategories
    : sortedCategories.filter(isCategoryVisible);

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">图书分类管理</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              管理图书分类信息，支持层级分类
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加分类
          </button>
        </div>

        {/* 搜索栏和批量操作栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="搜索分类名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* 批量操作按钮 */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                已选择 {selectedCategories.length} 项
              </span>
              <button
                onClick={() => setIsMoveDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                移动
              </button>
              <button
                onClick={handleBatchDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive bg-background px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                删除
              </button>
            </div>
          )}
        </div>

        {/* 分类表格 */}
        <CategoryTable
          categories={categories}
          displayCategories={displayCategories}
          collapsedCategories={collapsedCategories}
          selectedCategories={selectedCategories}
          deleteConfirm={deleteConfirm}
          onToggleCollapse={toggleCollapse}
          onSelectChange={setSelectedCategories}
          onEdit={handleEdit}
          onDeleteClick={(id) => setDeleteConfirm(id)}
          onDeleteConfirm={handleDelete}
          onDeleteCancel={() => setDeleteConfirm(null)}
          getCategoryLevel={getCategoryLevel}
          hasChildren={hasChildren}
        />

        {/* 统计信息 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* 批量移动对话框 */}
      {isMoveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMoveDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">批量移动分类</h3>
            <p className="text-sm text-muted-foreground mb-4">
              将 {selectedCategories.length} 个分类移动到:
            </p>
            <select
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm mb-4"
              onChange={(e) => handleBatchMove(e.target.value || null)}
            >
              <option value="">选择目标分类...</option>
              <option value="">-- 顶级分类 --</option>
              {categories
                .filter((cat) => !selectedCategories.includes(cat.id))
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsMoveDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-accent transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
