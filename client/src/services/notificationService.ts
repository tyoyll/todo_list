import api from './api';

export interface Notification {
  id: string;
  userId: string;
  type: 'TASK_REMINDER' | 'REST_REMINDER' | 'ACHIEVEMENT' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  relatedTaskId?: string;
  createdAt: string;
}

export interface NotificationQuery {
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

const notificationService = {
  // 获取通知列表
  getNotifications: (params?: NotificationQuery) =>
    api.get<{
      data: Notification[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>('/notifications', { params }),

  // 获取未读通知数
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread/count'),

  // 标记为已读
  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`),

  // 标记全部已读
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),

  // 删除通知
  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`),

  // 清空所有通知
  clearAll: () =>
    api.delete('/notifications/clear'),
};

export default notificationService;

