import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import './NotificationSettingsPage.scss';

interface NotificationSettings {
  emailNotifications: boolean;
  taskReminders: boolean;
  restReminders: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
  reminderTime: number; // 提前提醒时间（分钟）
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    taskReminders: true,
    restReminders: true,
    achievementNotifications: true,
    systemNotifications: true,
    reminderTime: 15,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserSettings();
      
      // 从用户设置中提取通知相关设置
      if (response.data.notifications) {
        setSettings(response.data.notifications);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateUserSettings({
        notifications: settings,
      });
      alert('设置保存成功！');
    } catch (error: any) {
      console.error('保存设置失败:', error);
      alert(error.response?.data?.message || '保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key: keyof NotificationSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="notification-settings-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="notification-settings-page">
      <div className="page-header">
        <h1>通知设置</h1>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h2>通知类型</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">📧 邮件通知</div>
                <div className="setting-desc">接收重要事项的邮件提醒</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">📋 任务提醒</div>
                <div className="setting-desc">任务到期前收到提醒</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.taskReminders}
                  onChange={() => handleToggle('taskReminders')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">☕ 休息提醒</div>
                <div className="setting-desc">工作一段时间后提醒休息</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.restReminders}
                  onChange={() => handleToggle('restReminders')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">🎉 成就通知</div>
                <div className="setting-desc">完成里程碑时收到祝贺</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.achievementNotifications}
                  onChange={() => handleToggle('achievementNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">🔔 系统通知</div>
                <div className="setting-desc">接收系统更新和重要公告</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.systemNotifications}
                  onChange={() => handleToggle('systemNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>提醒时间</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">⏰ 提前提醒</div>
                <div className="setting-desc">任务到期前多久提醒</div>
              </div>
              <select
                value={settings.reminderTime}
                onChange={(e) => handleChange('reminderTime', Number(e.target.value))}
                className="select-input"
              >
                <option value={5}>5 分钟</option>
                <option value={10}>10 分钟</option>
                <option value={15}>15 分钟</option>
                <option value={30}>30 分钟</option>
                <option value={60}>1 小时</option>
                <option value={120}>2 小时</option>
                <option value={1440}>1 天</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>免打扰时段</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">🌙 启用免打扰</div>
                <div className="setting-desc">在指定时间段内不接收通知</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.quietHoursEnabled}
                  onChange={() => handleToggle('quietHoursEnabled')}
                />
                <span className="slider"></span>
              </label>
            </div>

            {settings.quietHoursEnabled && (
              <>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">开始时间</div>
                  </div>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                    className="time-input"
                  />
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">结束时间</div>
                  </div>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                    className="time-input"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={loadSettings}
            disabled={saving}
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;

