import { IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 时间范围枚举
 */
export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

/**
 * 统计查询DTO
 */
export class StatsQueryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange;
}

/**
 * 任务统计响应接口
 */
export interface TaskStatsResponse {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  overdueTasks: number;
  categoryStats: Array<{
    category: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  priorityStats: Array<{
    priority: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
}

/**
 * 效率分析响应接口
 */
export interface EfficiencyStatsResponse {
  averageCompletionTime: number; // 平均完成时间（分钟）
  averageTasksPerDay: number;
  mostProductiveHour: number;
  mostProductiveDay: string;
  efficiencyTrend: Array<{
    date: string;
    tasksCompleted: number;
    averageTime: number;
  }>;
}

