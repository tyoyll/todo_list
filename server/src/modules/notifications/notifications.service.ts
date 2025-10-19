import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './entities/notification.entity';
import { Task } from '../tasks/entities/task.entity';
import { TimeRecord } from '../time-management/entities/time-record.entity';
import {
  CreateNotificationDto,
  NotificationType,
} from './dto/notification.dto';

/**
 * 通知服务
 */
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TimeRecord)
    private readonly timeRecordRepository: Repository<TimeRecord>,
  ) {}

  /**
   * 创建通知
   */
  async createNotification(createDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(createDto);
    return await this.notificationRepository.save(notification);
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number },
  ) {
    const query: any = { userId };

    if (options?.unreadOnly) {
      query.isRead = false;
    }

    return await this.notificationRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: options?.limit || 50,
    });
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId: string) {
    return await this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    return { message: '所有通知已标记为已读' };
  }

  /**
   * 删除通知
   */
  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    await this.notificationRepository.remove(notification);

    return { message: '通知已删除' };
  }

  /**
   * 清除所有已读通知
   */
  async clearReadNotifications(userId: string) {
    await this.notificationRepository.delete({
      userId,
      isRead: true,
    });

    return { message: '已清除所有已读通知' };
  }

  /**
   * 定时任务：检查任务截止时间
   * 每小时执行一次
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkTaskDeadlines() {
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 查找即将到期的任务（未完成且24小时内到期）
    const upcomingTasks = await this.taskRepository.find({
      where: {
        status: 'TODO' as any,
        dueDate: Between(now, oneDayLater),
      },
    });

    // 为每个任务创建提醒
    for (const task of upcomingTasks) {
      // 检查是否已经发送过提醒
      const existingNotification =
        await this.notificationRepository.findOne({
          where: {
            userId: task.userId,
            type: NotificationType.TASK_DEADLINE,
            taskId: task.id,
            createdAt: MoreThan(
              new Date(now.getTime() - 24 * 60 * 60 * 1000),
            ),
          },
        });

      if (!existingNotification) {
        await this.createNotification({
          userId: task.userId,
          type: NotificationType.TASK_DEADLINE,
          title: '任务即将到期',
          content: `任务"${task.title}"将在24小时内到期，请及时处理。`,
          taskId: task.id,
          link: `/tasks/${task.id}`,
        });
      }
    }

    // 查找已逾期的任务
    const overdueTasks = await this.taskRepository.find({
      where: {
        status: 'TODO' as any,
        dueDate: LessThan(now),
      },
    });

    // 为逾期任务创建提醒
    for (const task of overdueTasks) {
      // 每天只发送一次逾期提醒
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const existingNotification =
        await this.notificationRepository.findOne({
          where: {
            userId: task.userId,
            type: NotificationType.TASK_OVERDUE,
            taskId: task.id,
            createdAt: MoreThan(todayStart),
          },
        });

      if (!existingNotification) {
        await this.createNotification({
          userId: task.userId,
          type: NotificationType.TASK_OVERDUE,
          title: '任务已逾期',
          content: `任务"${task.title}"已逾期，请尽快处理。`,
          taskId: task.id,
          link: `/tasks/${task.id}`,
        });
      }
    }
  }

  /**
   * 检查重要任务
   * 每天早上9点执行
   */
  @Cron('0 9 * * *')
  async checkImportantTasks() {
    // 查找高优先级且未完成的任务
    const importantTasks = await this.taskRepository.find({
      where: {
        priority: 'HIGH' as any,
        status: 'TODO' as any,
      },
    });

    for (const task of importantTasks) {
      // 每天只发送一次重要任务提醒
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingNotification =
        await this.notificationRepository.findOne({
          where: {
            userId: task.userId,
            type: NotificationType.IMPORTANT_TASK,
            taskId: task.id,
            createdAt: MoreThan(todayStart),
          },
        });

      if (!existingNotification) {
        await this.createNotification({
          userId: task.userId,
          type: NotificationType.IMPORTANT_TASK,
          title: '重要任务提醒',
          content: `您有一个高优先级任务："${task.title}"，请注意完成。`,
          taskId: task.id,
          link: `/tasks/${task.id}`,
        });
      }
    }
  }

  /**
   * 检查工作时长，提醒休息
   * 这个方法可以被时间管理服务调用
   */
  async checkRestReminder(userId: string) {
    // 获取今天的工作记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await this.timeRecordRepository.find({
      where: {
        userId,
        startTime: MoreThan(today),
        endTime: IsNull(),
      },
    });

    // 检查是否有正在进行的工作记录
    if (records.length > 0) {
      const activeRecord = records[0];
      const now = new Date();
      const workDuration =
        (now.getTime() - activeRecord.startTime.getTime()) / 1000 / 60;

      // 如果工作超过50分钟，提醒休息
      if (workDuration >= 50) {
        // 检查最近是否已经发送过休息提醒（1小时内只发送一次）
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentReminder = await this.notificationRepository.findOne({
          where: {
            userId,
            type: NotificationType.REST_REMINDER,
            createdAt: MoreThan(oneHourAgo),
          },
        });

        if (!recentReminder) {
          await this.createNotification({
            userId,
            type: NotificationType.REST_REMINDER,
            title: '休息提醒',
            content: `您已经连续工作了${Math.floor(workDuration)}分钟，建议休息一下。`,
            link: '/pomodoro',
          });
        }
      }
    }
  }
}

// 导入Between用于日期范围查询
import { Between } from 'typeorm';

