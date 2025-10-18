/**
 * 通用类型定义
 */

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 分页响应接口
 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 排序参数接口
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 筛选参数接口
 */
export interface FilterParams {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
}

/**
 * 查询参数接口（组合分页、排序、筛选）
 */
export interface QueryParams extends PaginationParams, SortParams, FilterParams {}
