import React, { useEffect, useState } from 'react';
import './NotificationToast.scss';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationToastProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ messages, onClose }) => {
  return (
    <div className="notification-toast-container">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onClose={onClose} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ message, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = message.duration || 3000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(message.id);
    }, 300); // 等待动画完成
  };

  const getIcon = (): string => {
    switch (message.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '●';
    }
  };

  return (
    <div className={`toast-item toast-${message.type} ${isLeaving ? 'leaving' : ''}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-title">{message.title}</div>
        <div className="toast-message">{message.message}</div>
      </div>
      <button className="toast-close" onClick={handleClose}>
        ✕
      </button>
    </div>
  );
};

export default NotificationToast;

// Toast管理Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title: string, message: string, duration?: number) => {
    showToast('success', title, message, duration);
  };

  const error = (title: string, message: string, duration?: number) => {
    showToast('error', title, message, duration);
  };

  const warning = (title: string, message: string, duration?: number) => {
    showToast('warning', title, message, duration);
  };

  const info = (title: string, message: string, duration?: number) => {
    showToast('info', title, message, duration);
  };

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

