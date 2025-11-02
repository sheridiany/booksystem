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
 * 读者端登录页面
 *
 * 设计理念:
 * - 居中卡片式设计,简洁友好
 * - 配色: 渐变紫色 + 温暖橙色 (活泼现代)
 * - 动态背景: 浮动的书本图标
 * - 强调阅读体验
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

  // 固定的背景装饰位置 (避免 hydration 错误)
  const floatingBooks = [
    { left: '10%', top: '15%', size: 25, delay: 0, duration: 15 },
    { left: '85%', top: '10%', size: 30, delay: 1, duration: 18 },
    { left: '20%', top: '75%', size: 20, delay: 2, duration: 20 },
    { left: '70%', top: '80%', size: 35, delay: 0.5, duration: 16 },
    { left: '45%', top: '5%', size: 28, delay: 1.5, duration: 14 },
    { left: '5%', top: '50%', size: 22, delay: 3, duration: 19 },
    { left: '90%', top: '45%', size: 32, delay: 2.5, duration: 17 },
    { left: '60%', top: '25%', size: 26, delay: 4, duration: 15 },
    { left: '30%', top: '90%', size: 24, delay: 1, duration: 18 },
    { left: '75%', top: '60%', size: 29, delay: 3.5, duration: 16 },
    { left: '15%', top: '35%', size: 27, delay: 2, duration: 20 },
    { left: '50%', top: '70%', size: 23, delay: 4.5, duration: 14 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 relative overflow-hidden p-4">
      {/* 动态背景装饰 (固定位置) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 浮动书本图标 */}
        {floatingBooks.map((book, i) => (
          <div
            key={i}
            className="absolute text-white/10 animate-float"
            style={{
              left: book.left,
              top: book.top,
              fontSize: `${book.size}px`,
              animationDelay: `${book.delay}s`,
              animationDuration: `${book.duration}s`,
            }}
          >
            📚
          </div>
        ))}
      </div>

      {/* 登录卡片 (缩小) */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
          {/* Logo 与标题 (缩小) */}
          <div className="text-center mb-6">
            <div className="mb-3">
              {/* 阅读图标 (缩小) */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-2">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m0 18h12v-8H6v8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
              众慧图书借阅
            </h1>
            <p className="text-slate-600 text-sm">开启你的阅读之旅</p>
          </div>

          {/* 错误提示 */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 登录表单 (缩小间距) */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 用户名 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-slate-400"
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
                <input
                  {...register('username')}
                  id="username"
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="请输入用户名"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* 密码 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-slate-400"
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
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="请输入密码"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 记住我 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-slate-600"
              >
                记住我
              </label>
            </div>

            {/* 登录按钮 (缩小) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 text-sm rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  开始阅读
                </span>
              )}
            </button>
          </form>

          {/* 底部提示 (精简) */}
          <div className="mt-6 text-center text-xs text-slate-600">
            暂无账号?{' '}
            <a
              href="#"
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              联系管理员
            </a>
          </div>

          {/* 开发提示 (缩小) */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-purple-800 text-xs">
            <p className="font-medium mb-0.5">💡 测试账号</p>
            <p>reader / reader123</p>
          </div>
        </div>

        {/* 底部版权 (缩小) */}
        <div className="text-center mt-4 text-white/70 text-xs">
          © 2025 众慧图书 📖
        </div>
      </div>

      {/* 全局动画样式 */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.2;
          }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
