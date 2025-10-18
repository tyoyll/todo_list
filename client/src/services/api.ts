import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

/**
 * API 基础配置
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * 创建 Axios 实例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token 到请求头
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // Token 过期或无效，尝试刷新 token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              // 刷新 token 的逻辑
              const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              
              // 更新 token
              localStorage.setItem('token', data.token);
              
              // 重试原请求
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${data.token}`;
                return apiClient.request(error.config);
              }
            } catch (refreshError) {
              // 刷新失败，跳转到登录页
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
              message.error('登录已过期，请重新登录');
            }
          } else {
            // 没有 refresh token，跳转到登录页
            window.location.href = '/login';
            message.error('请先登录');
          }
          break;
          
        case 403:
          message.error('没有权限访问');
          break;
          
        case 404:
          message.error('请求的资源不存在');
          break;
          
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
          
        default:
          message.error(response.data?.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络错误，请检查网络连接');
    } else {
      // 请求配置出错
      message.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

