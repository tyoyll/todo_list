import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import timeManagementService, { TimeRecord } from '../../services/timeManagementService';
import './TimeRecordsPage.scss';

const TimeRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    loadRecords();
  }, [startDate, endDate]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await timeManagementService.getTimeRecords({
        startDate,
        endDate,
      });
      setRecords(response.data);
      
      // 计算总时长
      const total = response.data.reduce((sum, record) => {
        return sum + (record.duration || 0);
      }, 0);
      setTotalDuration(total);
    } catch (error: any) {
      console.error('加载记录失败:', error);
      alert(error.response?.data?.message || '加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} 小时 ${minutes} 分钟`;
    }
    return `${minutes} 分钟`;
  };

  const formatDateTime = (dateString: string): string => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };

  const groupRecordsByDate = () => {
    const grouped: { [key: string]: TimeRecord[] } = {};
    
    records.forEach((record) => {
      const date = format(new Date(record.startTime), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });

    return grouped;
  };

  const groupedRecords = groupRecordsByDate();
  const dates = Object.keys(groupedRecords).sort().reverse();

  return (
    <div className="time-records-page">
      <div className="page-header">
        <h1>工作记录</h1>
        
        <div className="filter-bar">
          <div className="date-filter">
            <label>开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="date-filter">
            <label>结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-label">总记录数</div>
          <div className="stat-value">{records.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">总工作时长</div>
          <div className="stat-value">{formatDuration(totalDuration)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">平均时长</div>
          <div className="stat-value">
            {records.length > 0 ? formatDuration(Math.floor(totalDuration / records.length)) : '0 分钟'}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <p>暂无工作记录</p>
        </div>
      ) : (
        <div className="records-list">
          {dates.map((date) => (
            <div key={date} className="date-group">
              <div className="date-header">
                <h3>{date}</h3>
                <span className="daily-total">
                  总计: {formatDuration(
                    groupedRecords[date].reduce((sum, r) => sum + (r.duration || 0), 0)
                  )}
                </span>
              </div>
              
              <div className="records">
                {groupedRecords[date].map((record) => (
                  <div key={record.id} className="record-item">
                    <div className="record-time">
                      <div className="start-time">
                        开始: {format(new Date(record.startTime), 'HH:mm:ss')}
                      </div>
                      {record.endTime && (
                        <div className="end-time">
                          结束: {format(new Date(record.endTime), 'HH:mm:ss')}
                        </div>
                      )}
                    </div>
                    
                    <div className="record-info">
                      {record.description && (
                        <div className="description">{record.description}</div>
                      )}
                      {record.taskId && (
                        <div className="task-tag">
                          <span>关联任务</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="record-duration">
                      {record.duration ? formatDuration(record.duration) : '进行中...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeRecordsPage;

