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
      {/* 左侧 - 品牌装饰区 (缩小) */}
      <div className="hidden lg:flex lg:w-5/12 max-w-md bg-gradient-to-br from-slate-800/50 via-blue-800/50 to-slate-800/50 rounded-2xl relative overflow-hidden mr-4 backdrop-blur-sm border border-white/10" style={{ height: '580px' }}>
        {/* 背景装饰 - 书籍网格 */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full gap-4 p-8 rotate-12 scale-125">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/20 rounded-sm"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  animation: 'fadeIn 2s ease-in-out infinite alternate',
                }}
              />
            ))}
          </div>
        </div>

        {/* 中央内容 (精简) */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-8 w-full">
          {/* Logo 与标题 (缩小) */}
          <div className="mb-8 text-center">
            <div className="mb-3">
              {/* 书本 SVG Icon (缩小) */}
              <svg
                className="w-14 h-14 mx-auto text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
              众慧图书借阅
            </h1>
            <p className="text-sm text-slate-300">管理端</p>
          </div>

          {/* 特色说明 (精简) */}
          <div className="space-y-4 max-w-xs">
            <FeatureItem
              icon="📚"
              title="智能管理"
              description="高效便捷"
            />
            <FeatureItem
              icon="📖"
              title="在线预览"
              description="PDF/EPUB"
            />
            <FeatureItem
              icon="🎯"
              title="数据统计"
              description="实时可视"
            />
          </div>

          {/* 底部装饰 (缩小) */}
          <div className="absolute bottom-6 text-slate-400 text-xs">
            © 2025 众慧图书
          </div>
        </div>
      </div>

      {/* 右侧 - 登录表单 (缩小) */}
      <div className="w-full max-w-sm">
        <div className="w-full">
          {/* 移动端 Logo (缩小) */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              众慧图书借阅
            </h1>
            <p className="text-slate-300 text-sm">管理端</p>
          </div>

          {/* 登录卡片 (缩小) */}
          <div className="bg-white rounded-xl shadow-xl p-6 border border-slate-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                欢迎回来
              </h2>
              <p className="text-slate-600 text-sm">请使用管理员账号登录</p>
            </div>

            {/* 错误提示 */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errorMessage}
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
                <input
                  {...register('username')}
                  id="username"
                  type="text"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="请输入用户名"
                  disabled={isLoading}
                />
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
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="请输入密码"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* 记住我 (暂未实现) */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-slate-600">记住我</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  忘记密码?
                </a>
              </div>

              {/* 登录按钮 (缩小) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 text-sm rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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

            {/* 底部提示 (缩小) */}
            <div className="mt-6 text-center text-xs text-slate-600">
              暂无账号?{' '}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                联系管理员
              </a>
            </div>
          </div>

          {/* 开发提示 (缩小) */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <p className="font-medium mb-0.5">💡 测试账号</p>
            <p>
              admin / admin123
            </p>
          </div>
        </div>
      </div>

      {/* 全局动画样式 */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0.05;
          }
          100% {
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * 特色功能项组件 (精简版)
 */
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center space-x-3 group">
      <div className="text-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-sm mb-0.5">{title}</h3>
        <p className="text-slate-400 text-xs">{description}</p>
      </div>
    </div>
  );
}
