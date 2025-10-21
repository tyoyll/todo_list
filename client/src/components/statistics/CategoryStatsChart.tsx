import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CategoryStatsChartProps {
  data: Array<{
    category: string;
    total: number;
    completed: number;
  }>;
}

const CategoryStatsChart: React.FC<CategoryStatsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#1890ff" name="总任务数" />
        <Bar dataKey="completed" fill="#52c41a" name="已完成" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryStatsChart;

