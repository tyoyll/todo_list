import apiClient from './api';
import { User } from '../store/slices/authSlice';

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

/**
 * 认证服务
 */
class AuthService {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<any, LoginResponse>('/auth/login', credentials);
    return response;
  }

  /**
   * 用户注册
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<any, LoginResponse>('/auth/register', userData);
    return response;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any, User>('/auth/me');
    return response;
  }

  /**
   * 刷新 token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.post<any, { token: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    return response;
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
}

export default new AuthService();

