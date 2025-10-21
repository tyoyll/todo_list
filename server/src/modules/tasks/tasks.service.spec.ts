import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskNote } from './entities/task-note.entity';
import { Attachment } from './entities/attachment.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus, TaskPriority } from './dto/create-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: any;
  let taskNoteRepository: any;
  let attachmentRepository: any;

  const mockUser = {
    id: '1',
    username: 'testuser',
  };

  const mockTask = {
    id: '1',
    userId: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    category: 'Work',
    tags: ['test'],
    dueDate: new Date(),
    estimatedDuration: 60,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
  };

  const mockTaskNoteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockAttachmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(TaskNote),
          useValue: mockTaskNoteRepository,
        },
        {
          provide: getRepositoryToken(Attachment),
          useValue: mockAttachmentRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get(getRepositoryToken(Task));
    taskNoteRepository = module.get(getRepositoryToken(TaskNote));
    attachmentRepository = module.get(getRepositoryToken(Attachment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('应该成功创建任务', async () => {
      const userId = '1';
      const createTaskDto = {
        title: 'New Task',
        description: 'Task Description',
        priority: TaskPriority.HIGH,
      };

      mockTaskRepository.create.mockReturnValue({
        ...createTaskDto,
        userId,
        status: TaskStatus.TODO,
      });
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const result = await service.createTask(userId, createTaskDto);

      expect(result).toBeDefined();
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        userId,
        status: 'TODO',
      });
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });
  });

  describe('getTasks', () => {
    it('应该成功获取任务列表', async () => {
      const userId = '1';
      const queryTaskDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as any,
        sortOrder: 'DESC' as any,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
      };

      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTasks(userId, queryTaskDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('应该支持状态筛选', async () => {
      const userId = '1';
      const queryTaskDto = {
        page: 1,
        limit: 10,
        status: TaskStatus.TODO,
        sortBy: 'createdAt' as any,
        sortOrder: 'DESC' as any,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
      };

      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getTasks(userId, queryTaskDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: TaskStatus.TODO },
      );
    });
  });

  describe('getTaskById', () => {
    it('应该成功获取任务详情', async () => {
      const userId = '1';
      const taskId = '1';

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById(userId, taskId);

      expect(result).toBeDefined();
      expect(result.id).toBe(taskId);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['taskNotes', 'attachments'],
      });
    });

    it('应该在任务不存在时抛出异常', async () => {
      const userId = '1';
      const taskId = '999';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.getTaskById(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTaskById(userId, taskId)).rejects.toThrow(
        '任务不存在',
      );
    });

    it('应该在无权访问时抛出异常', async () => {
      const userId = '2';
      const taskId = '1';

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.getTaskById(userId, taskId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getTaskById(userId, taskId)).rejects.toThrow(
        '无权访问此任务',
      );
    });
  });

  describe('updateTask', () => {
    it('应该成功更新任务', async () => {
      const userId = '1';
      const taskId = '1';
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue({
        ...mockTask,
        ...updateTaskDto,
      });

      const result = await service.updateTask(userId, taskId, updateTaskDto);

      expect(result).toBeDefined();
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });

    it('应该在任务完成时记录完成时间', async () => {
      const userId = '1';
      const taskId = '1';
      const updateTaskDto = {
        status: TaskStatus.COMPLETED,
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue({
        ...mockTask,
        ...updateTaskDto,
        completedAt: new Date(),
      });

      const result = await service.updateTask(userId, taskId, updateTaskDto);

      expect(result).toBeDefined();
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('deleteTask', () => {
    it('应该成功删除任务（软删除）', async () => {
      const userId = '1';
      const taskId = '1';

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteTask(userId, taskId);

      expect(result.message).toBe('任务已删除');
      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(taskId);
    });
  });

  describe('addTaskNote', () => {
    it('应该成功添加任务笔记', async () => {
      const userId = '1';
      const taskId = '1';
      const createTaskNoteDto = {
        content: 'Test Note',
      };

      const mockNote = {
        id: '1',
        taskId,
        content: 'Test Note',
        createdAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskNoteRepository.create.mockReturnValue(mockNote);
      mockTaskNoteRepository.save.mockResolvedValue(mockNote);

      const result = await service.addTaskNote(
        userId,
        taskId,
        createTaskNoteDto,
      );

      expect(result).toBeDefined();
      expect(result.content).toBe('Test Note');
      expect(mockTaskNoteRepository.save).toHaveBeenCalled();
    });
  });

  describe('getTaskNotes', () => {
    it('应该成功获取任务笔记列表', async () => {
      const userId = '1';
      const taskId = '1';

      const mockNotes = [
        {
          id: '1',
          taskId,
          content: 'Note 1',
          createdAt: new Date(),
        },
      ];

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskNoteRepository.find.mockResolvedValue(mockNotes);

      const result = await service.getTaskNotes(userId, taskId);

      expect(result).toHaveLength(1);
      expect(mockTaskNoteRepository.find).toHaveBeenCalledWith({
        where: { taskId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('deleteTaskNote', () => {
    it('应该成功删除任务笔记', async () => {
      const userId = '1';
      const taskId = '1';
      const noteId = '1';

      const mockNote = {
        id: noteId,
        taskId,
        content: 'Test Note',
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskNoteRepository.findOne.mockResolvedValue(mockNote);
      mockTaskNoteRepository.remove.mockResolvedValue(mockNote);

      const result = await service.deleteTaskNote(userId, taskId, noteId);

      expect(result.message).toBe('笔记已删除');
      expect(mockTaskNoteRepository.remove).toHaveBeenCalledWith(mockNote);
    });

    it('应该在笔记不存在时抛出异常', async () => {
      const userId = '1';
      const taskId = '1';
      const noteId = '999';

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskNoteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteTaskNote(userId, taskId, noteId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.deleteTaskNote(userId, taskId, noteId),
      ).rejects.toThrow('笔记不存在');
    });
  });

  describe('addAttachment', () => {
    it('应该成功添加任务附件', async () => {
      const userId = '1';
      const taskId = '1';
      const mockFile = {
        originalname: 'test.pdf',
        path: 'uploads/test.pdf',
        size: 1024,
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const mockAttachment = {
        id: '1',
        taskId,
        fileName: 'test.pdf',
        filePath: 'uploads/test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockAttachmentRepository.create.mockReturnValue(mockAttachment);
      mockAttachmentRepository.save.mockResolvedValue(mockAttachment);

      const result = await service.addAttachment(userId, taskId, mockFile);

      expect(result).toBeDefined();
      expect(result.fileName).toBe('test.pdf');
      expect(mockAttachmentRepository.save).toHaveBeenCalled();
    });
  });

  describe('getTaskStats', () => {
    it('应该成功获取任务统计信息', async () => {
      const userId = '1';

      mockTaskRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(5) // completed
        .mockResolvedValueOnce(3) // inProgress
        .mockResolvedValueOnce(2); // todo

      const result = await service.getTaskStats(userId);

      expect(result).toBeDefined();
      expect(result.total).toBe(10);
      expect(result.completed).toBe(5);
      expect(result.inProgress).toBe(3);
      expect(result.todo).toBe(2);
      expect(result.completionRate).toBe(50);
    });

    it('应该在没有任务时返回0%完成率', async () => {
      const userId = '1';

      mockTaskRepository.count
        .mockResolvedValueOnce(0) // total
        .mockResolvedValueOnce(0) // completed
        .mockResolvedValueOnce(0) // inProgress
        .mockResolvedValueOnce(0); // todo

      const result = await service.getTaskStats(userId);

      expect(result.total).toBe(0);
      expect(result.completionRate).toBe(0);
    });
  });
});

