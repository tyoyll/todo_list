import React, { useState, useEffect } from 'react';
import statisticsService, { TaskStats, EfficiencyStats } from '../../services/statisticsService';
import TaskCompletionChart from '../../components/statistics/TaskCompletionChart';
import PriorityDistributionChart from '../../components/statistics/PriorityDistributionChart';
import CategoryStatsChart from '../../components/statistics/CategoryStatsChart';
import WorkTimeDistributionChart from '../../components/statistics/WorkTimeDistributionChart';
import './StatisticsPage.scss';

const StatisticsPage: React.FC = () => {
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [efficiencyStats, setEfficiencyStats] = useState<EfficiencyStats | null>(null);
  const [timeRange, setTimeRange] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('WEEK');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticsService.getOverallStats({ timeRange });
      setTaskStats(response.data.taskStats);
      setEfficiencyStats(response.data.efficiencyStats);
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockTrendData = [
    { date: '1/1', completed: 5, created: 8 },
    { date: '1/2', completed: 7, created: 6 },
    { date: '1/3', completed: 4, created: 10 },
    { date: '1/4', completed: 9, created: 7 },
    { date: '1/5', completed: 6, created: 9 },
    { date: '1/6', completed: 8, created: 5 },
    { date: '1/7', completed: 10, created: 8 },
  ];

  const mockWorkTimeData = [
    { hour: 9, duration: 3600 },
    { hour: 10, duration: 5400 },
    { hour: 11, duration: 4800 },
    { hour: 14, duration: 6000 },
    { hour: 15, duration: 7200 },
    { hour: 16, duration: 5400 },
    { hour: 17, duration: 3600 },
  ];

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>数据统计</h1>
        
        <div className="time-range-selector">
          <button
            className={timeRange === 'DAY' ? 'active' : ''}
            onClick={() => setTimeRange('DAY')}
          >
            今日
          </button>
          <button
            className={timeRange === 'WEEK' ? 'active' : ''}
            onClick={() => setTimeRange('WEEK')}
          >
            本周
          </button>
          <button
            className={timeRange === 'MONTH' ? 'active' : ''}
            onClick={() => setTimeRange('MONTH')}
          >
            本月
          </button>
          <button
            className={timeRange === 'YEAR' ? 'active' : ''}
            onClick={() => setTimeRange('YEAR')}
          >
            今年
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <>
          {/* 关键指标 */}
          {taskStats && (
            <div className="key-metrics">
              <div className="metric-card">
                <div className="metric-icon">📋</div>
                <div className="metric-info">
                  <div className="metric-label">总任务数</div>
                  <div className="metric-value">{taskStats.totalTasks}</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-info">
                  <div className="metric-label">已完成</div>
                  <div className="metric-value">{taskStats.completedTasks}</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🎯</div>
                <div className="metric-info">
                  <div className="metric-label">完成率</div>
                  <div className="metric-value">
                    {taskStats.completionRate.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">⚠️</div>
                <div className="metric-info">
                  <div className="metric-label">逾期任务</div>
                  <div className="metric-value danger">{taskStats.overdueTasks}</div>
                </div>
              </div>
            </div>
          )}

          {/* 图表区域 */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>任务完成趋势</h3>
              <TaskCompletionChart data={mockTrendData} />
            </div>

            {taskStats && taskStats.priorityStats.length > 0 && (
              <div className="chart-card">
                <h3>优先级分布</h3>
                <PriorityDistributionChart data={taskStats.priorityStats} />
              </div>
            )}

            {taskStats && taskStats.categoryStats.length > 0 && (
              <div className="chart-card full-width">
                <h3>分类统计</h3>
                <CategoryStatsChart data={taskStats.categoryStats} />
              </div>
            )}

            <div className="chart-card full-width">
              <h3>工作时间分布</h3>
              <WorkTimeDistributionChart data={mockWorkTimeData} />
            </div>
          </div>

          {/* 效率分析 */}
          {efficiencyStats && (
            <div className="efficiency-section">
              <h2>效率分析</h2>
              <div className="efficiency-cards">
                <div className="efficiency-card">
                  <div className="label">平均完成时间</div>
                  <div className="value">
                    {Math.round(efficiencyStats.averageCompletionTime / 3600)} 小时
                  </div>
                </div>
                
                <div className="efficiency-card">
                  <div className="label">日均任务量</div>
                  <div className="value">
                    {efficiencyStats.averageTasksPerDay.toFixed(1)} 个
                  </div>
                </div>
                
                <div className="efficiency-card">
                  <div className="label">最高效时段</div>
                  <div className="value">
                    {efficiencyStats.mostProductiveHour}:00
                  </div>
                </div>
                
                <div className="efficiency-card">
                  <div className="label">最高效日</div>
                  <div className="value">{efficiencyStats.mostProductiveDay}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatisticsPage;

