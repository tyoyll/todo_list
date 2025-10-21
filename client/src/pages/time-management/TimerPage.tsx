import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import timeManagementService, { TimeRecord } from '../../services/timeManagementService';
import taskService, { Task } from '../../services/taskService';
import './TimerPage.scss';

const TimerPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentRecord, setCurrentRecord] = useState<TimeRecord | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && currentRecord) {
      interval = setInterval(() => {
        const start = new Date(currentRecord.startTime).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentRecord]);

  const loadTasks = async () => {
    try {
      const response = await taskService.getTasks({ status: 'IN_PROGRESS' });
      setTasks(response.data.data);
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      const response = await timeManagementService.startTimeRecord({
        taskId: selectedTask || undefined,
        description: description || undefined,
      });
      setCurrentRecord(response.data);
      setIsRunning(true);
      setElapsedTime(0);
    } catch (error: any) {
      alert(error.response?.data?.message || '启动计时失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!currentRecord) return;

    try {
      setLoading(true);
      await timeManagementService.endTimeRecord({ recordId: currentRecord.id });
      setIsRunning(false);
      setCurrentRecord(null);
      setElapsedTime(0);
      setSelectedTask('');
      setDescription('');
    } catch (error: any) {
      alert(error.response?.data?.message || '停止计时失败');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-page">
      <div className="timer-container">
        <h1>工作计时器</h1>

        <div className="timer-display">
          <div className="time">{formatTime(elapsedTime)}</div>
          <div className="status">{isRunning ? '计时中...' : '未开始'}</div>
        </div>

        {!isRunning && (
          <div className="timer-form">
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

            <div className="form-group">
              <label>工作描述（可选）</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入工作描述"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {currentRecord && selectedTask && (
          <div className="current-task-info">
            <h3>当前任务</h3>
            <p>{tasks.find((t) => t.id === selectedTask)?.title}</p>
          </div>
        )}

        <div className="timer-actions">
          {!isRunning ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? '启动中...' : '开始计时'}
            </button>
          ) : (
            <button
              className="btn btn-danger btn-lg"
              onClick={handleStop}
              disabled={loading}
            >
              {loading ? '停止中...' : '停止计时'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerPage;

