import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeManagementService } from './time-management.service';
import { TimeRecord } from './entities/time-record.entity';
import { PomodoroRecord } from './entities/pomodoro-record.entity';
import { Task } from '../tasks/entities/task.entity';
import { NotFoundException } from '@nestjs/common';

describe('TimeManagementService', () => {
  let service: TimeManagementService;
  let timeRecordRepository: Repository<TimeRecord>;
  let pomodoroRepository: Repository<PomodoroRecord>;
  let taskRepository: Repository<Task>;

  const mockTimeRecordRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPomodoroRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTaskRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeManagementService,
        {
          provide: getRepositoryToken(TimeRecord),
          useValue: mockTimeRecordRepository,
        },
        {
          provide: getRepositoryToken(PomodoroRecord),
          useValue: mockPomodoroRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TimeManagementService>(TimeManagementService);
    timeRecordRepository = module.get<Repository<TimeRecord>>(
      getRepositoryToken(TimeRecord),
    );
    pomodoroRepository = module.get<Repository<PomodoroRecord>>(
      getRepositoryToken(PomodoroRecord),
    );
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startWork', () => {
    it('应该成功开始工作记录', async () => {
      const userId = 1;
      const taskId = 1;
      const mockTask = { id: taskId, title: 'Test Task' };
      const mockTimeRecord = {
        id: 1,
        userId,
        taskId,
        startTime: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTimeRecordRepository.create.mockReturnValue(mockTimeRecord);
      mockTimeRecordRepository.save.mockResolvedValue(mockTimeRecord);

      const result = await service.startWork(userId, taskId);

      expect(result).toEqual(mockTimeRecord);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(mockTimeRecordRepository.create).toHaveBeenCalled();
      expect(mockTimeRecordRepository.save).toHaveBeenCalled();
    });

    it('当任务不存在时应该抛出异常', async () => {
      const userId = 1;
      const taskId = 999;

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.startWork(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('stopWork', () => {
    it('应该成功停止工作记录', async () => {
      const recordId = 1;
      const userId = 1;
      const mockRecord = {
        id: recordId,
        userId,
        startTime: new Date(Date.now() - 3600000), // 1小时前
        endTime: null,
        duration: null,
      };

      mockTimeRecordRepository.findOne.mockResolvedValue(mockRecord);
      mockTimeRecordRepository.save.mockResolvedValue({
        ...mockRecord,
        endTime: new Date(),
        duration: 3600,
      });

      const result = await service.stopWork(recordId, userId);

      expect(result.endTime).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(mockTimeRecordRepository.save).toHaveBeenCalled();
    });

    it('当记录不存在时应该抛出异常', async () => {
      const recordId = 999;
      const userId = 1;

      mockTimeRecordRepository.findOne.mockResolvedValue(null);

      await expect(service.stopWork(recordId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('startPomodoro', () => {
    it('应该成功开始番茄钟', async () => {
      const userId = 1;
      const taskId = 1;
      const duration = 25;
      const mockPomodoro = {
        id: 1,
        userId,
        taskId,
        startTime: new Date(),
        duration,
        isCompleted: false,
      };

      mockPomodoroRepository.create.mockReturnValue(mockPomodoro);
      mockPomodoroRepository.save.mockResolvedValue(mockPomodoro);

      const result = await service.startPomodoro(userId, taskId, duration);

      expect(result).toEqual(mockPomodoro);
      expect(mockPomodoroRepository.create).toHaveBeenCalledWith({
        userId,
        taskId,
        startTime: expect.any(Date),
        duration,
        isCompleted: false,
      });
    });
  });

  describe('completePomodoro', () => {
    it('应该成功完成番茄钟', async () => {
      const pomodoroId = 1;
      const userId = 1;
      const mockPomodoro = {
        id: pomodoroId,
        userId,
        isCompleted: false,
      };

      mockPomodoroRepository.findOne.mockResolvedValue(mockPomodoro);
      mockPomodoroRepository.save.mockResolvedValue({
        ...mockPomodoro,
        isCompleted: true,
        endTime: new Date(),
      });

      const result = await service.completePomodoro(pomodoroId, userId);

      expect(result.isCompleted).toBe(true);
      expect(result.endTime).toBeDefined();
    });
  });

  describe('getWorkStatistics', () => {
    it('应该返回工作统计数据', async () => {
      const userId = 1;
      const mockStats = {
        totalDuration: 7200, // 2小时
        recordCount: 3,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
      };

      mockTimeRecordRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getWorkStatistics(
        userId,
        new Date(),
        new Date(),
      );

      expect(result).toEqual(mockStats);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });
});

