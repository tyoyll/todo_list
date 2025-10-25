import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import {
  Notification,
  NotificationType,
} from './entities/notification.entity';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建通知', async () => {
      const userId = 1;
      const notificationData = {
        type: NotificationType.TASK_DEADLINE,
        title: '任务即将截止',
        content: '任务"完成项目"将在1小时后截止',
      };

      const mockNotification = {
        id: 1,
        userId,
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(userId, notificationData);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        userId,
        ...notificationData,
        isRead: false,
      });
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('应该返回用户的所有通知', async () => {
      const userId = 1;
      const mockNotifications = [
        { id: 1, userId, title: '通知1', isRead: false },
        { id: 2, userId, title: '通知2', isRead: true },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);
      mockNotificationRepository.count.mockResolvedValue(2);

      const result = await service.findAll(userId, 1, 10);

      expect(result.data).toEqual(mockNotifications);
      expect(result.total).toBe(2);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('应该支持分页', async () => {
      const userId = 1;
      const page = 2;
      const limit = 10;

      mockNotificationRepository.find.mockResolvedValue([]);
      mockNotificationRepository.count.mockResolvedValue(0);

      await service.findAll(userId, page, limit);

      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: 10, // (page - 1) * limit
        take: 10,
      });
    });

    it('应该支持按已读状态筛选', async () => {
      const userId = 1;
      const isRead = false;

      mockNotificationRepository.find.mockResolvedValue([]);
      mockNotificationRepository.count.mockResolvedValue(0);

      await service.findAll(userId, 1, 10, isRead);

      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId, isRead },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('应该返回指定的通知', async () => {
      const userId = 1;
      const notificationId = 1;
      const mockNotification = {
        id: notificationId,
        userId,
        title: '测试通知',
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);

      const result = await service.findOne(notificationId, userId);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, userId },
      });
    });

    it('当通知不存在时应该抛出异常', async () => {
      const userId = 1;
      const notificationId = 999;

      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(notificationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('应该标记通知为已读', async () => {
      const userId = 1;
      const notificationId = 1;
      const mockNotification = {
        id: notificationId,
        userId,
        isRead: false,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markAsRead(notificationId, userId);

      expect(result.isRead).toBe(true);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('应该标记所有通知为已读', async () => {
      const userId = 1;

      mockNotificationRepository.update.mockResolvedValue({ affected: 5 });

      await service.markAllAsRead(userId);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        { userId, isRead: false },
        { isRead: true },
      );
    });
  });

  describe('delete', () => {
    it('应该删除通知', async () => {
      const userId = 1;
      const notificationId = 1;
      const mockNotification = {
        id: notificationId,
        userId,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(notificationId, userId);

      expect(mockNotificationRepository.delete).toHaveBeenCalledWith(
        notificationId,
      );
    });

    it('当通知不存在时应该抛出异常', async () => {
      const userId = 1;
      const notificationId = 999;

      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(notificationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUnreadCount', () => {
    it('应该返回未读通知数量', async () => {
      const userId = 1;
      const unreadCount = 5;

      mockNotificationRepository.count.mockResolvedValue(unreadCount);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(unreadCount);
      expect(mockNotificationRepository.count).toHaveBeenCalledWith({
        where: { userId, isRead: false },
      });
    });
  });

  describe('createTaskDeadlineNotification', () => {
    it('应该创建任务截止通知', async () => {
      const userId = 1;
      const taskTitle = '完成项目';
      const deadline = new Date(Date.now() + 3600000); // 1小时后

      const mockNotification = {
        id: 1,
        userId,
        type: NotificationType.TASK_DEADLINE,
        title: '任务即将截止',
        content: expect.stringContaining(taskTitle),
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createTaskDeadlineNotification(
        userId,
        taskTitle,
        deadline,
      );

      expect(result).toEqual(mockNotification);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.TASK_DEADLINE,
        }),
      );
    });
  });

  describe('createBreakReminder', () => {
    it('应该创建休息提醒通知', async () => {
      const userId = 1;
      const workDuration = 120; // 2小时

      const mockNotification = {
        id: 1,
        userId,
        type: NotificationType.BREAK_REMINDER,
        title: '休息提醒',
        content: expect.stringContaining('休息'),
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createBreakReminder(userId, workDuration);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.BREAK_REMINDER,
        }),
      );
    });
  });
});

