import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface PriorityDistributionChartProps {
  data: Array<{
    priority: string;
    total: number;
  }>;
}

const COLORS: { [key: string]: string } = {
  HIGH: '#ff4d4f',
  MEDIUM: '#faad14',
  LOW: '#52c41a',
};

const PRIORITY_LABELS: { [key: string]: string } = {
  HIGH: '高优先级',
  MEDIUM: '中优先级',
  LOW: '低优先级',
};

const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: PRIORITY_LABELS[item.priority] || item.priority,
    value: item.total,
    color: COLORS[item.priority] || '#999',
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PriorityDistributionChart;

