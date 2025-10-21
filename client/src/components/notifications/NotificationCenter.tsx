import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import notificationService, { Notification } from '../../services/notificationService';
import './NotificationCenter.scss';

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [filter, page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        isRead: filter === 'UNREAD' ? false : undefined,
        page,
        limit: 10,
      });
      setNotifications(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('全部标记已读失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条通知吗？')) return;

    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有通知吗？此操作不可恢复！')) return;

    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error('清空通知失败:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'TASK_REMINDER':
        return '📋';
      case 'REST_REMINDER':
        return '☕';
      case 'ACHIEVEMENT':
        return '🎉';
      case 'SYSTEM':
        return '🔔';
      default:
        return '📢';
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h2>通知中心</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="notification-controls">
        <div className="filter-buttons">
          <button
            className={filter === 'ALL' ? 'active' : ''}
            onClick={() => setFilter('ALL')}
          >
            全部
          </button>
          <button
            className={filter === 'UNREAD' ? 'active' : ''}
            onClick={() => setFilter('UNREAD')}
          >
            未读
          </button>
        </div>

        <div className="action-buttons">
          <button onClick={handleMarkAllAsRead}>全部已读</button>
          <button onClick={handleClearAll}>清空通知</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>暂无通知</p>
        </div>
      ) : (
        <>
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {format(new Date(notification.createdAt), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="标记已读"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(notification.id)}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </button>
              <span>
                第 {page} / {totalPages} 页
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationCenter;

