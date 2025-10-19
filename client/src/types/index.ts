/**
 * 通用类型定义
 */

export * from '../services/userService';
export * from '../services/taskService';

/**
 * API 响应通用格式
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * 分页响应元数据
 */
export interface PaginationMeta extends PaginationParams {
  total: number;
  totalPages: number;
}

/**
 * 表单验证规则
 */
export interface ValidationRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

