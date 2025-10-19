import apiClient from './api';

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

/**
 * 任务接口
 */
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  tags?: string[];
  dueDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建任务DTO
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  tags?: string[];
  dueDate?: Date | string;
  estimatedDuration?: number;
}

/**
 * 更新任务DTO
 */
export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
}

/**
 * 任务查询参数
 */
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 任务列表响应
 */
export interface TaskListResponse {
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 任务笔记接口
 */
export interface TaskNote {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 任务附件接口
 */
export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

/**
 * 任务统计接口
 */
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionRate: number;
}

/**
 * 任务服务类
 */
class TaskService {
  /**
   * 创建任务
   */
  async createTask(data: CreateTaskDto): Promise<Task> {
    return await apiClient.post('/tasks', data);
  }

  /**
   * 获取任务列表
   */
  async getTasks(params?: TaskQueryParams): Promise<TaskListResponse> {
    return await apiClient.get('/tasks', { params });
  }

  /**
   * 获取任务详情
   */
  async getTaskById(id: string): Promise<Task> {
    return await apiClient.get(`/tasks/${id}`);
  }

  /**
   * 更新任务
   */
  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    return await apiClient.put(`/tasks/${id}`, data);
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<{ message: string }> {
    return await apiClient.delete(`/tasks/${id}`);
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return await apiClient.patch(`/tasks/${id}/status`, { status });
  }

  /**
   * 获取任务统计
   */
  async getTaskStats(): Promise<TaskStats> {
    return await apiClient.get('/tasks/stats');
  }

  /**
   * 添加任务笔记
   */
  async addTaskNote(taskId: string, content: string): Promise<TaskNote> {
    return await apiClient.post(`/tasks/${taskId}/notes`, { content });
  }

  /**
   * 获取任务笔记列表
   */
  async getTaskNotes(taskId: string): Promise<TaskNote[]> {
    return await apiClient.get(`/tasks/${taskId}/notes`);
  }

  /**
   * 删除任务笔记
   */
  async deleteTaskNote(taskId: string, noteId: string): Promise<{ message: string }> {
    return await apiClient.delete(`/tasks/${taskId}/notes/${noteId}`);
  }

  /**
   * 上传任务附件
   */
  async uploadAttachment(taskId: string, file: File): Promise<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 获取任务附件列表
   */
  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    return await apiClient.get(`/tasks/${taskId}/attachments`);
  }

  /**
   * 删除任务附件
   */
  async deleteAttachment(taskId: string, attachmentId: string): Promise<{ message: string }> {
    return await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }
}

export default new TaskService();

