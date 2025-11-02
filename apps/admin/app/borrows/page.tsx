'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { borrowsApi, type BorrowQueryParams } from '@/lib/api/borrows';
import { BookOpen, RotateCcw, CheckCircle, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';
import type { BorrowStatus } from '@repo/types';

/**
 * 借阅管理页面
 *
 * 功能：
 * - 借阅记录列表（分页、搜索、筛选）
 * - 办理借阅
 * - 办理归还
 * - 办理续借
 * - 逾期提醒
 */
export default function BorrowsPage() {
  const queryClient = useQueryClient();

  // 查询参数
  const [queryParams, setQueryParams] = useState<BorrowQueryParams>({
    page: 1,
    pageSize: 20,
  });

  // 获取借阅记录列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['borrows', queryParams],
    queryFn: () => borrowsApi.getBorrows(queryParams),
  });

  // 归还 mutation
  const returnMutation = useMutation({
    mutationFn: (borrowId: string) => borrowsApi.returnBook(borrowId),
    onSuccess: () => {
      toast.success('归还成功！');
      queryClient.invalidateQueries({ queryKey: ['borrows'] });
    },
    onError: (error: any) => {
      toast.error(`归还失败: ${error.response?.data?.message || error.message}`);
    },
  });

  // 续借 mutation
  const renewMutation = useMutation({
    mutationFn: (borrowId: string) => borrowsApi.renewBorrow(borrowId),
    onSuccess: () => {
      toast.success('续借成功！');
      queryClient.invalidateQueries({ queryKey: ['borrows'] });
    },
    onError: (error: any) => {
      toast.error(`续借失败: ${error.response?.data?.message || error.message}`);
    },
  });

  // 检查逾期 mutation
  const checkOverdueMutation = useMutation({
    mutationFn: () => borrowsApi.checkOverdue(),
    onSuccess: (result) => {
      toast.success(`已更新 ${result.updatedCount} 条逾期记录`);
      queryClient.invalidateQueries({ queryKey: ['borrows'] });
    },
    onError: (error: any) => {
      toast.error(`检查失败: ${error.response?.data?.message || error.message}`);
    },
  });

  /**
   * 处理状态筛选
   */
  const handleStatusFilter = (status?: BorrowStatus) => {
    setQueryParams({ ...queryParams, status, page: 1 });
  };

  /**
   * 处理分页
   */
  const handlePageChange = (page: number) => {
    setQueryParams({ ...queryParams, page });
  };

  /**
   * 处理归还
   */
  const handleReturn = (borrowId: string, bookTitle?: string) => {
    if (confirm(`确认归还图书"${bookTitle || '未知书名'}"？`)) {
      returnMutation.mutate(borrowId);
    }
  };

  /**
   * 处理续借
   */
  const handleRenew = (borrowId: string, bookTitle?: string, canRenew?: boolean) => {
    if (!canRenew) {
      toast.error('该图书已达续借次数上限');
      return;
    }
    if (confirm(`确认续借图书"${bookTitle || '未知书名'}"？`)) {
      renewMutation.mutate(borrowId);
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: BorrowStatus) => {
    switch (status) {
      case 'BORROWED':
        return 'bg-blue-100 text-blue-800';
      case 'RETURNED':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 获取状态文本
   */
  const getStatusText = (status: BorrowStatus) => {
    switch (status) {
      case 'BORROWED':
        return '借出中';
      case 'RETURNED':
        return '已归还';
      case 'OVERDUE':
        return '已逾期';
      default:
        return status;
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-destructive">
            加载失败: {(error as Error).message}
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
            <h1 className="text-2xl font-bold">借阅管理</h1>
            <p className="text-muted-foreground text-sm mt-1">
              管理图书借阅、归还、续借等操作
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => checkOverdueMutation.mutate()}
              disabled={checkOverdueMutation.isPending}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${checkOverdueMutation.isPending ? 'animate-spin' : ''}`} />
              检查逾期
            </button>
            <button
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              办理借阅
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">总借阅</div>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{data?.total || 0}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">借出中</div>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mt-2 text-blue-600">
              {data?.items?.filter(b => b.status === 'BORROWED').length || 0}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">已归还</div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              {data?.items?.filter(b => b.status === 'RETURNED').length || 0}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">已逾期</div>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">
              {data?.items?.filter(b => b.status === 'OVERDUE').length || 0}
            </div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-medium">状态筛选:</div>
          <button
            onClick={() => handleStatusFilter(undefined)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              !queryParams.status
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleStatusFilter('BORROWED')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              queryParams.status === 'BORROWED'
                ? 'bg-blue-600 text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            借出中
          </button>
          <button
            onClick={() => handleStatusFilter('RETURNED')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              queryParams.status === 'RETURNED'
                ? 'bg-green-600 text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            已归还
          </button>
          <button
            onClick={() => handleStatusFilter('OVERDUE')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              queryParams.status === 'OVERDUE'
                ? 'bg-red-600 text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            已逾期
          </button>
        </div>

        {/* 借阅记录表格 */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">图书信息</th>
                      <th className="px-4 py-3 text-left font-medium">读者信息</th>
                      <th className="px-4 py-3 text-left font-medium">借阅日期</th>
                      <th className="px-4 py-3 text-left font-medium">应还日期</th>
                      <th className="px-4 py-3 text-left font-medium">续借次数</th>
                      <th className="px-4 py-3 text-left font-medium">状态</th>
                      <th className="px-4 py-3 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.items.map((borrow) => (
                      <tr key={borrow.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{borrow.bookTitle || '未知书名'}</div>
                          <div className="text-xs text-muted-foreground">
                            {borrow.bookCopyType === 'EBOOK' ? '电子书' : '纸质书'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{borrow.readerName || '未知读者'}</div>
                        </td>
                        <td className="px-4 py-3">
                          {format(new Date(borrow.borrowDate), 'yyyy-MM-dd', { locale: zhCN })}
                        </td>
                        <td className="px-4 py-3">
                          {borrow.dueDate ? (
                            <div>
                              {format(new Date(borrow.dueDate), 'yyyy-MM-dd', { locale: zhCN })}
                              {borrow.daysRemaining !== undefined && borrow.status === 'BORROWED' && (
                                <div className={`text-xs mt-1 ${borrow.daysRemaining < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                  {borrow.daysRemaining < 0 ? `逾期 ${-borrow.daysRemaining} 天` : `剩余 ${borrow.daysRemaining} 天`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">无需归还</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {borrow.renewCount} 次
                          {borrow.canRenew === false && borrow.status === 'BORROWED' && (
                            <div className="text-xs text-orange-600 mt-1">已达上限</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(borrow.status)}`}>
                            {getStatusText(borrow.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {borrow.status === 'BORROWED' && (
                              <>
                                <button
                                  onClick={() => handleRenew(borrow.id, borrow.bookTitle, borrow.canRenew)}
                                  disabled={!borrow.canRenew || renewMutation.isPending}
                                  className="px-2 py-1 text-xs font-medium border rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="续借"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleReturn(borrow.id, borrow.bookTitle)}
                                  disabled={returnMutation.isPending}
                                  className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  归还
                                </button>
                              </>
                            )}
                            {borrow.status === 'OVERDUE' && (
                              <button
                                onClick={() => handleReturn(borrow.id, borrow.bookTitle)}
                                disabled={returnMutation.isPending}
                                className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                归还
                              </button>
                            )}
                            {borrow.status === 'RETURNED' && borrow.returnDate && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(borrow.returnDate), 'MM-dd', { locale: zhCN })} 归还
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {data.totalPages > 1 && (
                <div className="border-t px-4 py-3 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {data.total} 条记录，第 {data.page} / {data.totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(data.page - 1)}
                      disabled={data.page === 1}
                      className="px-3 py-1 text-sm border rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => handlePageChange(data.page + 1)}
                      disabled={data.page === data.totalPages}
                      className="px-3 py-1 text-sm border rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <div className="text-muted-foreground">暂无借阅记录</div>
              <div className="text-sm text-muted-foreground mt-1">
                点击"办理借阅"按钮开始录入
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
