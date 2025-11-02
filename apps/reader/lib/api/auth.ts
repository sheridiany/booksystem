import { apiClient } from './client';

/**
 * 登录请求 DTO
 */
export interface LoginDto {
  username: string;
  password: string;
}

/**
 * 登录响应 DTO
 */
export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * 用户信息 DTO
 */
export interface UserDto {
  id: string;
  username: string;
  role: string;
}

/**
 * 认证 API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login: async (data: LoginDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>('/auth/login', data);
    return response.data;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>('/auth/me');
    return response.data;
  },

  /**
   * 登出 (仅清除本地数据)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
