import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from './statistics.service';
import { Task, TaskStatus, TaskPriority } from '../tasks/entities/task.entity';
import { TimeRecord } from '../time-management/entities/time-record.entity';
import { PomodoroRecord } from '../time-management/entities/pomodoro-record.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let taskRepository: Repository<Task>;
  let timeRecordRepository: Repository<TimeRecord>;
  let pomodoroRepository: Repository<PomodoroRecord>;

  const mockTaskRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTimeRecordRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockPomodoroRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(TimeRecord),
          useValue: mockTimeRecordRepository,
        },
        {
          provide: getRepositoryToken(PomodoroRecord),
          useValue: mockPomodoroRepository,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    timeRecordRepository = module.get<Repository<TimeRecord>>(
      getRepositoryToken(TimeRecord),
    );
    pomodoroRepository = module.get<Repository<PomodoroRecord>>(
      getRepositoryToken(PomodoroRecord),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaskCompletionRate', () => {
    it('应该返回正确的完成率', async () => {
      const userId = 1;
      mockTaskRepository.count
        .mockResolvedValueOnce(100) // 总任务数
        .mockResolvedValueOnce(75); // 已完成任务数

      const result = await service.getTaskCompletionRate(userId);

      expect(result).toEqual({
        totalTasks: 100,
        completedTasks: 75,
        completionRate: 75,
      });
    });

    it('当没有任务时应该返回0%完成率', async () => {
      const userId = 1;
      mockTaskRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getTaskCompletionRate(userId);

      expect(result).toEqual({
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
      });
    });
  });

  describe('getTasksByPriority', () => {
    it('应该按优先级分组统计任务', async () => {
      const userId = 1;
      const mockTasks = [
        { priority: TaskPriority.HIGH },
        { priority: TaskPriority.HIGH },
        { priority: TaskPriority.MEDIUM },
        { priority: TaskPriority.LOW },
      ];

      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await service.getTasksByPriority(userId);

      expect(result[TaskPriority.HIGH]).toBe(2);
      expect(result[TaskPriority.MEDIUM]).toBe(1);
      expect(result[TaskPriority.LOW]).toBe(1);
      expect(result[TaskPriority.URGENT]).toBe(0);
    });
  });

  describe('getTasksByCategory', () => {
    it('应该按分类统计任务', async () => {
      const userId = 1;
      const mockResult = [
        { category: 'Work', count: '10' },
        { category: 'Personal', count: '5' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockResult),
      };

      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTasksByCategory(userId);

      expect(result).toEqual({
        Work: 10,
        Personal: 5,
      });
    });
  });

  describe('getWorkTimeStatistics', () => {
    it('应该返回工作时间统计', async () => {
      const userId = 1;
      const mockResult = {
        totalDuration: '14400', // 4小时（秒）
        avgDuration: '1800', // 30分钟
        recordCount: '8',
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockResult),
      };

      mockTimeRecordRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getWorkTimeStatistics(
        userId,
        new Date(),
        new Date(),
      );

      expect(result).toEqual({
        totalDuration: 14400,
        avgDuration: 1800,
        recordCount: 8,
      });
    });
  });

  describe('getPomodoroStatistics', () => {
    it('应该返回番茄钟统计', async () => {
      const userId = 1;
      mockPomodoroRepository.count
        .mockResolvedValueOnce(20) // 总番茄钟数
        .mockResolvedValueOnce(18); // 完成的番茄钟数

      const result = await service.getPomodoroStatistics(
        userId,
        new Date(),
        new Date(),
      );

      expect(result).toEqual({
        totalPomodoros: 20,
        completedPomodoros: 18,
        completionRate: 90,
      });
    });
  });

  describe('getProductivityTrend', () => {
    it('应该返回生产力趋势数据', async () => {
      const userId = 1;
      const days = 7;

      const mockTaskQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2025-01-01', count: '5' },
          { date: '2025-01-02', count: '8' },
        ]),
      };

      mockTaskRepository.createQueryBuilder.mockReturnValue(
        mockTaskQueryBuilder,
      );

      const result = await service.getProductivityTrend(userId, days);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getOverdueTasks', () => {
    it('应该返回逾期任务统计', async () => {
      const userId = 1;
      const overdueCount = 5;

      mockTaskRepository.count.mockResolvedValue(overdueCount);

      const result = await service.getOverdueTasks(userId);

      expect(result).toEqual({
        overdueCount,
      });
      expect(mockTaskRepository.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId,
          status: expect.not.objectContaining({ value: TaskStatus.COMPLETED }),
        }),
      });
    });
  });
});

