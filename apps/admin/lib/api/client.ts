import axios from 'axios';

/**
 * Axios 客户端实例
 *
 * 功能:
 * - 统一配置 baseURL
 * - 自动添加 JWT Token
 * - 统一错误处理
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * 请求拦截器 - 自动添加 JWT Token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一错误处理
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 未授权 - 清除 token 并跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
