import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import {
  StatsQueryDto,
  TaskStatsResponse,
  EfficiencyStatsResponse,
  TimeRange,
} from './dto/stats-query.dto';

/**
 * 统计服务
 */
@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * 获取日期范围
   */
  private getDateRange(query: StatsQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = query.endDate || new Date();
    let startDate = query.startDate;

    if (!startDate && query.timeRange) {
      const now = new Date(endDate);
      switch (query.timeRange) {
        case TimeRange.DAY:
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case TimeRange.WEEK:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case TimeRange.MONTH:
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case TimeRange.YEAR:
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
      }
    }

    if (!startDate) {
      startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - 1);
    }

    return { startDate, endDate };
  }

  /**
   * 获取任务完成率统计
   */
  async getTaskCompletionStats(
    userId: string,
    query: StatsQueryDto,
  ): Promise<TaskStatsResponse> {
    const { startDate, endDate } = this.getDateRange(query);

    // 获取时间范围内的所有任务
    const tasks = await this.taskRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === 'IN_PROGRESS',
    ).length;
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 计算逾期任务
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) =>
        t.status !== 'COMPLETED' &&
        t.dueDate &&
        new Date(t.dueDate) < now,
    ).length;

    // 按分类统计
    const categoryMap = new Map<string, { total: number; completed: number }>();
    tasks.forEach((task) => {
      const category = task.category || '未分类';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, completed: 0 });
      }
      const stats = categoryMap.get(category)!;
      stats.total++;
      if (task.status === 'COMPLETED') {
        stats.completed++;
      }
    });

    const categoryStats = Array.from(categoryMap.entries()).map(
      ([category, stats]) => ({
        category,
        total: stats.total,
        completed: stats.completed,
        completionRate:
          stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }),
    );

    // 按优先级统计
    const priorityMap = new Map<string, { total: number; completed: number }>();
    tasks.forEach((task) => {
      const priority = task.priority;
      if (!priorityMap.has(priority)) {
        priorityMap.set(priority, { total: 0, completed: 0 });
      }
      const stats = priorityMap.get(priority)!;
      stats.total++;
      if (task.status === 'COMPLETED') {
        stats.completed++;
      }
    });

    const priorityStats = Array.from(priorityMap.entries()).map(
      ([priority, stats]) => ({
        priority,
        total: stats.total,
        completed: stats.completed,
        completionRate:
          stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }),
    );

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
      overdueTasks,
      categoryStats,
      priorityStats,
    };
  }

  /**
   * 获取分类统计
   */
  async getCategoryStats(userId: string, query: StatsQueryDto) {
    const stats = await this.getTaskCompletionStats(userId, query);
    return stats.categoryStats;
  }

  /**
   * 获取优先级统计
   */
  async getPriorityStats(userId: string, query: StatsQueryDto) {
    const stats = await this.getTaskCompletionStats(userId, query);
    return stats.priorityStats;
  }

  /**
   * 获取效率分析
   */
  async getEfficiencyStats(
    userId: string,
    query: StatsQueryDto,
  ): Promise<EfficiencyStatsResponse> {
    const { startDate, endDate } = this.getDateRange(query);

    // 获取已完成的任务
    const completedTasks = await this.taskRepository.find({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: Between(startDate, endDate),
      },
    });

    // 计算平均完成时间
    let totalCompletionTime = 0;
    let taskCount = 0;

    completedTasks.forEach((task) => {
      if (task.completedAt && task.createdAt) {
        const time =
          (new Date(task.completedAt).getTime() -
            new Date(task.createdAt).getTime()) /
          1000 /
          60;
        totalCompletionTime += time;
        taskCount++;
      }
    });

    const averageCompletionTime =
      taskCount > 0 ? totalCompletionTime / taskCount : 0;

    // 计算平均每天完成的任务数
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const averageTasksPerDay =
      daysDiff > 0 ? completedTasks.length / daysDiff : 0;

    // 计算最高产出的小时
    const hourMap = new Map<number, number>();
    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      }
    });

    let mostProductiveHour = 0;
    let maxTasks = 0;
    hourMap.forEach((count, hour) => {
      if (count > maxTasks) {
        maxTasks = count;
        mostProductiveHour = hour;
      }
    });

    // 计算最高产出的星期几
    const dayMap = new Map<string, number>();
    const dayNames = [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ];

    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const dayIndex = new Date(task.completedAt).getDay();
        const dayName = dayNames[dayIndex];
        dayMap.set(dayName, (dayMap.get(dayName) || 0) + 1);
      }
    });

    let mostProductiveDay = '星期一';
    let maxDayTasks = 0;
    dayMap.forEach((count, day) => {
      if (count > maxDayTasks) {
        maxDayTasks = count;
        mostProductiveDay = day;
      }
    });

    // 按日期分组统计趋势
    const dateMap = new Map<
      string,
      { tasksCompleted: number; totalTime: number }
    >();

    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const date = new Date(task.completedAt).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
          dateMap.set(date, { tasksCompleted: 0, totalTime: 0 });
        }
        const dayData = dateMap.get(date)!;
        dayData.tasksCompleted++;

        if (task.createdAt) {
          const time =
            (new Date(task.completedAt).getTime() -
              new Date(task.createdAt).getTime()) /
            1000 /
            60;
          dayData.totalTime += time;
        }
      }
    });

    const efficiencyTrend = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        tasksCompleted: data.tasksCompleted,
        averageTime:
          data.tasksCompleted > 0 ? data.totalTime / data.tasksCompleted : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      averageCompletionTime,
      averageTasksPerDay,
      mostProductiveHour,
      mostProductiveDay,
      efficiencyTrend,
    };
  }

  /**
   * 获取综合统计信息
   */
  async getOverallStats(userId: string, query: StatsQueryDto) {
    const [taskStats, efficiencyStats] = await Promise.all([
      this.getTaskCompletionStats(userId, query),
      this.getEfficiencyStats(userId, query),
    ]);

    return {
      taskStats,
      efficiencyStats,
    };
  }
}

