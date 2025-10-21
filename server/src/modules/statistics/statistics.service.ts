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
import { ExportReportDto, ReportType } from './dto/export-report.dto';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

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

  /**
   * 导出Excel报表
   */
  async exportToExcel(
    userId: string,
    exportDto: ExportReportDto,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Todo List App';
    workbook.created = new Date();

    const query: StatsQueryDto = {
      startDate: exportDto.startDate,
      endDate: exportDto.endDate,
    };

    // 获取统计数据
    const [taskStats, efficiencyStats] = await Promise.all([
      this.getTaskCompletionStats(userId, query),
      this.getEfficiencyStats(userId, query),
    ]);

    // 创建任务统计工作表
    const taskSheet = workbook.addWorksheet('任务统计');

    // 设置列宽
    taskSheet.columns = [
      { header: '指标', key: 'metric', width: 30 },
      { header: '数值', key: 'value', width: 20 },
    ];

    // 添加标题样式
    taskSheet.getRow(1).font = { bold: true, size: 12 };
    taskSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 添加任务统计数据
    taskSheet.addRow({ metric: '总任务数', value: taskStats.totalTasks });
    taskSheet.addRow({
      metric: '已完成任务数',
      value: taskStats.completedTasks,
    });
    taskSheet.addRow({
      metric: '进行中任务数',
      value: taskStats.inProgressTasks,
    });
    taskSheet.addRow({ metric: '待办任务数', value: taskStats.todoTasks });
    taskSheet.addRow({
      metric: '完成率',
      value: `${taskStats.completionRate.toFixed(2)}%`,
    });
    taskSheet.addRow({ metric: '逾期任务数', value: taskStats.overdueTasks });

    // 添加空行
    taskSheet.addRow({});

    // 添加分类统计
    taskSheet.addRow({ metric: '分类统计', value: '' });
    taskSheet.getRow(taskSheet.lastRow.number).font = { bold: true };

    taskSheet.addRow({ metric: '分类名称', value: '完成率' });
    taskStats.categoryStats.forEach((cat) => {
      taskSheet.addRow({
        metric: cat.category,
        value: `${cat.completed}/${cat.total} (${cat.completionRate.toFixed(2)}%)`,
      });
    });

    // 添加空行
    taskSheet.addRow({});

    // 添加优先级统计
    taskSheet.addRow({ metric: '优先级统计', value: '' });
    taskSheet.getRow(taskSheet.lastRow.number).font = { bold: true };

    taskSheet.addRow({ metric: '优先级', value: '完成率' });
    taskStats.priorityStats.forEach((pri) => {
      taskSheet.addRow({
        metric: pri.priority,
        value: `${pri.completed}/${pri.total} (${pri.completionRate.toFixed(2)}%)`,
      });
    });

    // 创建效率分析工作表
    const efficiencySheet = workbook.addWorksheet('效率分析');

    efficiencySheet.columns = [
      { header: '指标', key: 'metric', width: 30 },
      { header: '数值', key: 'value', width: 20 },
    ];

    efficiencySheet.getRow(1).font = { bold: true, size: 12 };
    efficiencySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    efficiencySheet.addRow({
      metric: '平均完成时间（分钟）',
      value: efficiencyStats.averageCompletionTime.toFixed(2),
    });
    efficiencySheet.addRow({
      metric: '平均每日完成任务数',
      value: efficiencyStats.averageTasksPerDay.toFixed(2),
    });
    efficiencySheet.addRow({
      metric: '最高产出时间',
      value: `${efficiencyStats.mostProductiveHour}:00`,
    });
    efficiencySheet.addRow({
      metric: '最高产出日期',
      value: efficiencyStats.mostProductiveDay,
    });

    // 添加效率趋势
    efficiencySheet.addRow({});
    efficiencySheet.addRow({ metric: '效率趋势', value: '' });
    efficiencySheet.getRow(efficiencySheet.lastRow.number).font = {
      bold: true,
    };

    const trendSheet = workbook.addWorksheet('效率趋势');
    trendSheet.columns = [
      { header: '日期', key: 'date', width: 15 },
      { header: '完成任务数', key: 'tasksCompleted', width: 15 },
      { header: '平均耗时（分钟）', key: 'averageTime', width: 20 },
    ];

    trendSheet.getRow(1).font = { bold: true, size: 12 };
    trendSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    efficiencyStats.efficiencyTrend.forEach((trend) => {
      trendSheet.addRow({
        date: trend.date,
        tasksCompleted: trend.tasksCompleted,
        averageTime: trend.averageTime.toFixed(2),
      });
    });

    // 生成Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * 导出PDF报表
   */
  async exportToPDF(
    userId: string,
    exportDto: ExportReportDto,
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const query: StatsQueryDto = {
          startDate: exportDto.startDate,
          endDate: exportDto.endDate,
        };

        // 获取统计数据
        const [taskStats, efficiencyStats] = await Promise.all([
          this.getTaskCompletionStats(userId, query),
          this.getEfficiencyStats(userId, query),
        ]);

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // 添加标题
        doc.fontSize(20).text('任务统计报表', { align: 'center' });
        doc.moveDown();

        // 添加日期范围
        const startDateStr = exportDto.startDate
          ? exportDto.startDate.toLocaleDateString('zh-CN')
          : '开始';
        const endDateStr = exportDto.endDate
          ? exportDto.endDate.toLocaleDateString('zh-CN')
          : '至今';
        doc
          .fontSize(12)
          .text(`统计时间：${startDateStr} 至 ${endDateStr}`, { align: 'center' });
        doc.moveDown(2);

        // 任务统计部分
        doc.fontSize(16).text('任务统计', { underline: true });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`总任务数：${taskStats.totalTasks}`);
        doc.text(`已完成任务数：${taskStats.completedTasks}`);
        doc.text(`进行中任务数：${taskStats.inProgressTasks}`);
        doc.text(`待办任务数：${taskStats.todoTasks}`);
        doc.text(`完成率：${taskStats.completionRate.toFixed(2)}%`);
        doc.text(`逾期任务数：${taskStats.overdueTasks}`);
        doc.moveDown(2);

        // 分类统计
        doc.fontSize(16).text('分类统计', { underline: true });
        doc.moveDown();
        doc.fontSize(12);

        if (taskStats.categoryStats.length > 0) {
          taskStats.categoryStats.forEach((cat) => {
            doc.text(
              `${cat.category}：${cat.completed}/${cat.total} (${cat.completionRate.toFixed(2)}%)`,
            );
          });
        } else {
          doc.text('暂无分类数据');
        }
        doc.moveDown(2);

        // 优先级统计
        doc.fontSize(16).text('优先级统计', { underline: true });
        doc.moveDown();
        doc.fontSize(12);

        if (taskStats.priorityStats.length > 0) {
          taskStats.priorityStats.forEach((pri) => {
            doc.text(
              `${pri.priority}：${pri.completed}/${pri.total} (${pri.completionRate.toFixed(2)}%)`,
            );
          });
        } else {
          doc.text('暂无优先级数据');
        }
        doc.moveDown(2);

        // 添加新页面用于效率分析
        doc.addPage();

        // 效率分析部分
        doc.fontSize(16).text('效率分析', { underline: true });
        doc.moveDown();
        doc.fontSize(12);

        doc.text(
          `平均完成时间：${efficiencyStats.averageCompletionTime.toFixed(2)} 分钟`,
        );
        doc.text(
          `平均每日完成任务数：${efficiencyStats.averageTasksPerDay.toFixed(2)}`,
        );
        doc.text(`最高产出时间：${efficiencyStats.mostProductiveHour}:00`);
        doc.text(`最高产出日期：${efficiencyStats.mostProductiveDay}`);
        doc.moveDown(2);

        // 效率趋势（只显示最近10条）
        doc.fontSize(16).text('效率趋势（最近10天）', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        const recentTrends = efficiencyStats.efficiencyTrend.slice(-10);
        if (recentTrends.length > 0) {
          recentTrends.forEach((trend) => {
            doc.text(
              `${trend.date}：完成 ${trend.tasksCompleted} 个任务，平均耗时 ${trend.averageTime.toFixed(2)} 分钟`,
            );
          });
        } else {
          doc.text('暂无趋势数据');
        }

        // 添加页脚
        doc.fontSize(8).text(`生成时间：${new Date().toLocaleString('zh-CN')}`, 50, doc.page.height - 50, {
          align: 'center',
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

