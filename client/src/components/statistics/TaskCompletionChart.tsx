import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TaskCompletionChartProps {
  data: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#52c41a"
          name="完成任务"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="created"
          stroke="#1890ff"
          name="创建任务"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TaskCompletionChart;

