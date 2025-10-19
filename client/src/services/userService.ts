import apiClient from './api';

/**
 * 用户信息接口
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 更新用户信息DTO
 */
export interface UpdateUserDto {
  nickname?: string;
  email?: string;
  avatarUrl?: string;
}

/**
 * 修改密码DTO
 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/**
 * 用户设置接口
 */
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'LIGHT' | 'DARK' | 'AUTO';
  language: 'ZH' | 'EN';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  workDuration: number;
  restDuration: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 更新用户设置DTO
 */
export interface UpdateSettingsDto {
  theme?: 'LIGHT' | 'DARK' | 'AUTO';
  language?: 'ZH' | 'EN';
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  workDuration?: number;
  restDuration?: number;
}

/**
 * 用户服务类
 */
class UserService {
  /**
   * 获取用户信息
   */
  async getProfile(): Promise<UserProfile> {
    return await apiClient.get('/users/profile');
  }

  /**
   * 更新用户信息
   */
  async updateProfile(data: UpdateUserDto): Promise<UserProfile> {
    return await apiClient.put('/users/profile', data);
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    return await apiClient.patch('/users/password', data);
  }

  /**
   * 获取用户设置
   */
  async getSettings(): Promise<UserSettings> {
    return await apiClient.get('/users/settings');
  }

  /**
   * 更新用户设置
   */
  async updateSettings(data: UpdateSettingsDto): Promise<UserSettings> {
    return await apiClient.put('/users/settings', data);
  }
}

export default new UserService();

