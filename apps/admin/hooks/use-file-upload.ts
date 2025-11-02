'use client';

import { useState, useCallback } from 'react';
import { booksApi } from '@/lib/api/books';

/**
 * 文件上传状态
 */
export interface UploadState {
  /**
   * 是否正在上传
   */
  isUploading: boolean;

  /**
   * 上传进度 (0-100)
   */
  progress: number;

  /**
   * 错误信息
   */
  error: string | null;

  /**
   * 上传成功后的文件 ID
   */
  fileId: string | null;
}

/**
 * 文件上传类型
 */
export type UploadType = 'cover' | 'content';

/**
 * 文件上传 Hook
 *
 * 功能：
 * - 封装文件上传逻辑
 * - 提供上传状态管理
 * - 支持上传进度（未来扩展）
 * - 错误处理
 *
 * @param bookId - 图书 ID（可选，创建时为空）
 */
export function useFileUpload(bookId?: string) {
  const [coverState, setCoverState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    fileId: null,
  });

  const [contentState, setContentState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    fileId: null,
  });

  /**
   * 上传封面图片
   */
  const uploadCover = useCallback(
    async (file: File): Promise<string | null> => {
      if (!bookId) {
        const error = '请先保存图书基本信息';
        setCoverState((prev) => ({ ...prev, error }));
        throw new Error(error);
      }

      setCoverState({
        isUploading: true,
        progress: 0,
        error: null,
        fileId: null,
      });

      try {
        // TODO: 未来可以添加 onUploadProgress 监听上传进度
        const fileId = await booksApi.uploadCover(bookId, file);

        setCoverState({
          isUploading: false,
          progress: 100,
          error: null,
          fileId,
        });

        return fileId;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message || '上传失败';
        setCoverState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          fileId: null,
        });
        throw error;
      }
    },
    [bookId]
  );

  /**
   * 上传内容文件（电子书）
   */
  const uploadContent = useCallback(
    async (file: File): Promise<string | null> => {
      if (!bookId) {
        const error = '请先保存图书基本信息';
        setContentState((prev) => ({ ...prev, error }));
        throw new Error(error);
      }

      setContentState({
        isUploading: true,
        progress: 0,
        error: null,
        fileId: null,
      });

      try {
        const fileId = await booksApi.uploadContent(bookId, file);

        setContentState({
          isUploading: false,
          progress: 100,
          error: null,
          fileId,
        });

        return fileId;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message || '上传失败';
        setContentState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          fileId: null,
        });
        throw error;
      }
    },
    [bookId]
  );

  /**
   * 重置上传状态
   */
  const resetCoverState = useCallback(() => {
    setCoverState({
      isUploading: false,
      progress: 0,
      error: null,
      fileId: null,
    });
  }, []);

  const resetContentState = useCallback(() => {
    setContentState({
      isUploading: false,
      progress: 0,
      error: null,
      fileId: null,
    });
  }, []);

  const resetAllStates = useCallback(() => {
    resetCoverState();
    resetContentState();
  }, [resetCoverState, resetContentState]);

  return {
    // 封面上传
    coverState,
    uploadCover,
    resetCoverState,

    // 内容文件上传
    contentState,
    uploadContent,
    resetContentState,

    // 工具方法
    resetAllStates,
  };
}
