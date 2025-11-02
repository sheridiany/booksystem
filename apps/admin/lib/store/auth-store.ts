import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '../api/auth';

/**
 * 认证状态接口
 */
interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: UserDto) => void;
  clearAuth: () => void;
  updateUser: (user: UserDto) => void;
}

/**
 * 认证状态管理 (Zustand)
 *
 * 功能:
 * - 管理用户登录状态
 * - 持久化 token 和用户信息到 localStorage
 * - 提供登录/登出方法
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /**
       * 设置认证信息 (登录成功后调用)
       */
      setAuth: (token, user) => {
        // 同时保存到 localStorage (兼容 axios 拦截器)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      /**
       * 清除认证信息 (登出时调用)
       */
      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      /**
       * 更新用户信息
       */
      updateUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
