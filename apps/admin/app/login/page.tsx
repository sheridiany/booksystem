'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, type LoginDto } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * 登录表单验证 Schema
 */
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码长度至少 6 位'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 管理端登录页面
 *
 * 设计理念:
 * - 左侧: 图书元素装饰区 (书籍插画、品牌信息)
 * - 右侧: 登录表单
 * - 配色: 深蓝 + 金色 (经典图书馆配色)
 * - 细节: 书本翻页动画、渐变背景
 */
export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * 处理登录提交
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.login(data as LoginDto);

      // 保存认证信息
      setAuth(response.accessToken, response.user);

      // 跳转到首页
      router.push('/');
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        '登录失败,请检查用户名和密码';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* 登录表单 */}
      <div className="w-full max-w-md">
        {/* 登录卡片 - 增强毛玻璃效果 */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl p-6 border border-white/30">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              众慧图书
            </h1>
          </div>

            {/* 错误提示 */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 用户名 */}
            <div>
              <div className="relative">
                <input
                  {...register('username')}
                  id="username"
                  type="text"
                  className="w-full pl-5 pr-12 py-3 text-sm text-white placeholder-white/60 bg-blue-500/20 backdrop-blur-lg border border-white/30 rounded-full focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all outline-none"
                  placeholder="用户名"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-white/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-200">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* 密码 */}
            <div>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="w-full pl-5 pr-12 py-3 text-sm text-white placeholder-white/60 bg-blue-500/20 backdrop-blur-lg border border-white/30 rounded-full focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all outline-none"
                  placeholder="密码"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-white/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-200">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 记住我 与 忘记密码 */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 text-white bg-blue-500/30 border-white/30 rounded focus:ring-white/50"
                  disabled={isLoading}
                />
                <span className="ml-2">记住我</span>
              </label>
              <a
                href="#"
                className="text-white hover:text-white/80 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                忘记密码?
              </a>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/90 hover:bg-white text-blue-900 py-3 px-6 text-sm font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
