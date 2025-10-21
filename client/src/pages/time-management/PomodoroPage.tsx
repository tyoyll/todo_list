import React, { useState, useEffect } from 'react';
import timeManagementService, { PomodoroRecord } from '../../services/timeManagementService';
import taskService, { Task } from '../../services/taskService';
import './PomodoroPage.scss';

const PomodoroPage: React.FC = () => {
  const [currentPomodoro, setCurrentPomodoro] = useState<PomodoroRecord | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [duration, setDuration] = useState(25); // 默认25分钟
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);

  useEffect(() => {
    loadTasks();
    loadTodayStats();
    checkCurrentPomodoro();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            handlePomodoroComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingTime]);

  const loadTasks = async () => {
    try {
      const response = await taskService.getTasks({ status: 'IN_PROGRESS' });
      setTasks(response.data.data);
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  };

  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await timeManagementService.getPomodoroRecords({
        startDate: today,
        endDate: today,
      });
      const completed = response.data.filter((p) => p.status === 'COMPLETED').length;
      setCompletedCount(completed);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const checkCurrentPomodoro = async () => {
    try {
      const response = await timeManagementService.getCurrentPomodoro();
      if (response.data && response.data.status === 'RUNNING') {
        setCurrentPomodoro(response.data);
        const start = new Date(response.data.createdAt).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        const remaining = response.data.plannedDuration * 60 - elapsed;
        if (remaining > 0) {
          setRemainingTime(remaining);
          setIsRunning(true);
        }
      }
    } catch (error) {
      console.error('检查当前番茄钟失败:', error);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      const response = await timeManagementService.startPomodoro({
        taskId: selectedTask || undefined,
        duration: duration,
      });
      setCurrentPomodoro(response.data);
      setRemainingTime(duration * 60);
      setIsRunning(true);
      setIsBreakTime(false);
    } catch (error: any) {
      alert(error.response?.data?.message || '启动番茄钟失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePomodoroComplete = async () => {
    if (!currentPomodoro) return;

    try {
      await timeManagementService.completePomodoro(currentPomodoro.id);
      setIsRunning(false);
      setCurrentPomodoro(null);
      setCompletedCount((prev) => prev + 1);
      playNotificationSound();
      alert('🎉 番茄钟完成！休息一下吧！');
      startBreak();
    } catch (error: any) {
      console.error('完成番茄钟失败:', error);
    }
  };

  const handleAbandon = async () => {
    if (!currentPomodoro) return;

    const reason = prompt('请输入放弃原因（可选）:');
    try {
      setLoading(true);
      await timeManagementService.abandonPomodoro(currentPomodoro.id, reason || undefined);
      setIsRunning(false);
      setCurrentPomodoro(null);
      setRemainingTime(0);
      setSelectedTask('');
    } catch (error: any) {
      alert(error.response?.data?.message || '放弃番茄钟失败');
    } finally {
      setLoading(false);
    }
  };

  const startBreak = () => {
    const breakDuration = completedCount % 4 === 3 ? 15 : 5; // 每4个番茄钟休息15分钟
    setIsBreakTime(true);
    setRemainingTime(breakDuration * 60);
    setIsRunning(true);
  };

  const playNotificationSound = () => {
    // 简单的提示音
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTCJ0vLTgjMGHm7A7+OZQQ0VYK/n5aVXFQlCm97tvGYfBTGO0fLTgDQGH2/A7+OYQAwWYa/o5KRYFQhBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvGkfBTCO0fLTgDQGHm/A7+OYQAwWYa/o5KRYFQlBnN7qvA==');
    audio.play().catch(() => {
      // 静默处理音频播放失败
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pomodoro-page">
      <div className="pomodoro-container">
        <h1>🍅 番茄钟</h1>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="label">今日完成:</span>
            <span className="value">{completedCount} 个</span>
          </div>
        </div>

        <div className="pomodoro-display">
          <div className="time">{formatTime(remainingTime)}</div>
          <div className="status">
            {isBreakTime ? '休息时间 🧘' : isRunning ? '专注中 💪' : '准备开始'}
          </div>
        </div>

        {!isRunning && !isBreakTime && (
          <div className="pomodoro-form">
            <div className="form-group">
              <label>番茄钟时长（分钟）</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={loading}
              >
                <option value={15}>15 分钟</option>
                <option value={25}>25 分钟（推荐）</option>
                <option value={30}>30 分钟</option>
                <option value={45}>45 分钟</option>
              </select>
            </div>

            <div className="form-group">
              <label>关联任务（可选）</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={loading}
              >
                <option value="">不关联任务</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentPomodoro && selectedTask && (
          <div className="current-task-info">
            <h3>当前任务</h3>
            <p>{tasks.find((t) => t.id === selectedTask)?.title}</p>
          </div>
        )}

        <div className="pomodoro-actions">
          {!isRunning ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? '启动中...' : '开始番茄钟'}
            </button>
          ) : !isBreakTime ? (
            <button
              className="btn btn-danger btn-lg"
              onClick={handleAbandon}
              disabled={loading}
            >
              {loading ? '处理中...' : '放弃番茄钟'}
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setIsRunning(false);
                setIsBreakTime(false);
                setRemainingTime(0);
              }}
            >
              跳过休息
            </button>
          )}
        </div>

        <div className="pomodoro-tips">
          <h3>💡 番茄工作法小贴士</h3>
          <ul>
            <li>专注工作 25 分钟，休息 5 分钟</li>
            <li>完成 4 个番茄钟后，休息 15-30 分钟</li>
            <li>番茄钟期间避免任何干扰</li>
            <li>如果被打断，当前番茄钟作废</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;

