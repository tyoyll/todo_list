import api from './api';

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  overdueTasks: number;
  categoryStats: Array<{
    category: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  priorityStats: Array<{
    priority: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
}

export interface EfficiencyStats {
  averageCompletionTime: number;
  averageTasksPerDay: number;
  mostProductiveHour: number;
  mostProductiveDay: string;
  efficiencyTrend: Array<{
    date: string;
    tasksCompleted: number;
    averageTime: number;
  }>;
}

export interface StatsQuery {
  startDate?: string;
  endDate?: string;
  timeRange?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

export interface ExportReportDto {
  reportType?: 'TASK_SUMMARY' | 'TIME_SUMMARY' | 'COMPLETE';
  startDate?: string;
  endDate?: string;
}

const statisticsService = {
  // 任务统计
  getTaskCompletionStats: (params?: StatsQuery) =>
    api.get<TaskStats>('/statistics/task-completion', { params }),

  getCategoryStats: (params?: StatsQuery) =>
    api.get('/statistics/categories', { params }),

  getPriorityStats: (params?: StatsQuery) =>
    api.get('/statistics/priorities', { params }),

  // 效率分析
  getEfficiencyStats: (params?: StatsQuery) =>
    api.get<EfficiencyStats>('/statistics/efficiency', { params }),

  // 综合统计
  getOverallStats: (params?: StatsQuery) =>
    api.get<{ taskStats: TaskStats; efficiencyStats: EfficiencyStats }>(
      '/statistics/overall',
      { params }
    ),

  // 导出
  exportToExcel: (params?: ExportReportDto) => {
    return api.get('/statistics/export/excel', {
      params,
      responseType: 'blob',
    });
  },

  exportToPDF: (params?: ExportReportDto) => {
    return api.get('/statistics/export/pdf', {
      params,
      responseType: 'blob',
    });
  },
};

export default statisticsService;

