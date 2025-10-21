import api from './api';

export interface TimeRecord {
  id: string;
  userId: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
  createdAt: string;
}

export interface PomodoroRecord {
  id: string;
  userId: string;
  taskId?: string;
  plannedDuration: number;
  actualDuration?: number;
  status: 'RUNNING' | 'COMPLETED' | 'ABANDONED';
  createdAt: string;
}

export interface StartTimeRecordDto {
  taskId?: string;
  description?: string;
}

export interface EndTimeRecordDto {
  recordId: string;
}

export interface StartPomodoroDto {
  taskId?: string;
  duration?: number;
}

const timeManagementService = {
  // 时间记录
  startTimeRecord: (data: StartTimeRecordDto) =>
    api.post<TimeRecord>('/time-management/start', data),

  endTimeRecord: (data: EndTimeRecordDto) =>
    api.post<TimeRecord>('/time-management/end', data),

  getTimeRecords: (params?: { startDate?: string; endDate?: string }) =>
    api.get<TimeRecord[]>('/time-management/records', { params }),

  // 番茄钟
  startPomodoro: (data: StartPomodoroDto) =>
    api.post<PomodoroRecord>('/time-management/pomodoro/start', data),

  completePomodoro: (id: string) =>
    api.post<PomodoroRecord>(`/time-management/pomodoro/${id}/complete`),

  abandonPomodoro: (id: string, reason?: string) =>
    api.post<PomodoroRecord>(`/time-management/pomodoro/${id}/abandon`, { reason }),

  getCurrentPomodoro: () =>
    api.get<PomodoroRecord | null>('/time-management/pomodoro/current'),

  getPomodoroRecords: (params?: { startDate?: string; endDate?: string }) =>
    api.get<PomodoroRecord[]>('/time-management/pomodoro/records', { params }),

  // 统计
  getDailyStats: (date?: string) =>
    api.get('/time-management/stats/daily', { params: { date } }),

  getWeeklyStats: () =>
    api.get('/time-management/stats/weekly'),

  getMonthlyStats: () =>
    api.get('/time-management/stats/monthly'),
};

export default timeManagementService;

