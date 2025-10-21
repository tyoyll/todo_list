import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WorkTimeDistributionChartProps {
  data: Array<{
    hour: number;
    duration: number;
  }>;
}

const WorkTimeDistributionChart: React.FC<WorkTimeDistributionChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    hour: `${item.hour}:00`,
    duration: Math.round(item.duration / 60), // 转换为分钟
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis label={{ value: '分钟', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value} 分钟`} />
        <Bar dataKey="duration" fill="#1890ff" name="工作时长" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WorkTimeDistributionChart;

