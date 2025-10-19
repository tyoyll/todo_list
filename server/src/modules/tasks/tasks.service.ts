import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskNote } from './entities/task-note.entity';
import { Attachment } from './entities/attachment.entity';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { CreateTaskNoteDto } from './dto/create-task-note.dto';

/**
 * 任务服务
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskNote)
    private readonly taskNoteRepository: Repository<TaskNote>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  /**
   * 创建任务
   */
  async createTask(userId: string, createTaskDto: CreateTaskDto) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
      status: 'TODO',
    });

    return await this.taskRepository.save(task);
  }

  /**
   * 获取任务列表
   */
  async getTasks(userId: string, queryTaskDto: QueryTaskDto) {
    const { page, limit, status, priority, category, search, sortBy, sortOrder } =
      queryTaskDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    // 应用筛选条件
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (category) {
      queryBuilder.andWhere('task.category = :category', { category });
    }

    // 搜索功能
    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 排序
    queryBuilder.orderBy(`task.${sortBy}`, sortOrder);

    // 分页
    queryBuilder.skip(skip).take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取任务详情
   */
  async getTaskById(userId: string, taskId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['taskNotes', 'attachments'],
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    // 验证任务所有权
    if (task.userId !== userId) {
      throw new ForbiddenException('无权访问此任务');
    }

    return task;
  }

  /**
   * 更新任务
   */
  async updateTask(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.getTaskById(userId, taskId);

    // 如果状态更改为已完成，记录完成时间
    if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      task.completedAt = new Date();
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  /**
   * 删除任务（软删除）
   */
  async deleteTask(userId: string, taskId: string) {
    const task = await this.getTaskById(userId, taskId);
    await this.taskRepository.softDelete(task.id);

    return {
      message: '任务已删除',
    };
  }

  /**
   * 更改任务状态
   */
  async updateTaskStatus(userId: string, taskId: string, status: TaskStatus) {
    return await this.updateTask(userId, taskId, { status });
  }

  /**
   * 添加任务笔记
   */
  async addTaskNote(userId: string, taskId: string, createTaskNoteDto: CreateTaskNoteDto) {
    // 验证任务是否存在且属于当前用户
    await this.getTaskById(userId, taskId);

    const taskNote = this.taskNoteRepository.create({
      taskId,
      content: createTaskNoteDto.content,
    });

    return await this.taskNoteRepository.save(taskNote);
  }

  /**
   * 获取任务笔记列表
   */
  async getTaskNotes(userId: string, taskId: string) {
    // 验证任务是否存在且属于当前用户
    await this.getTaskById(userId, taskId);

    return await this.taskNoteRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 删除任务笔记
   */
  async deleteTaskNote(userId: string, taskId: string, noteId: string) {
    // 验证任务是否存在且属于当前用户
    await this.getTaskById(userId, taskId);

    const note = await this.taskNoteRepository.findOne({
      where: { id: noteId, taskId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    await this.taskNoteRepository.remove(note);

    return {
      message: '笔记已删除',
    };
  }

  /**
   * 添加附件
   */
  async addAttachment(
    userId: string,
    taskId: string,
    file: Express.Multer.File,
  ) {
    // 验证任务是否存在且属于当前用户
    await this.getTaskById(userId, taskId);

    const attachment = this.attachmentRepository.create({
      taskId,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    return await this.attachmentRepository.save(attachment);
  }

  /**
   * 获取任务附件列表
   */
  async getAttachments(userId: string, taskId: string) {
    // 验证任务是否存在且属于当前用户
    await this.getTaskById(userId, taskId);

    return await this.attachmentRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 删除附件
   */
  async deleteAttachment(userId: string, taskId: string, attachmentId: string) {
    // 验证任务是否存在且属于当前用户
    await this.getTaskById(userId, taskId);

    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, taskId },
    });

    if (!attachment) {
      throw new NotFoundException('附件不存在');
    }

    // 这里可以添加删除文件系统中文件的逻辑
    // const fs = require('fs').promises;
    // await fs.unlink(attachment.filePath);

    await this.attachmentRepository.remove(attachment);

    return {
      message: '附件已删除',
    };
  }

  /**
   * 获取任务统计信息
   */
  async getTaskStats(userId: string) {
    const total = await this.taskRepository.count({
      where: { userId },
    });

    const completed = await this.taskRepository.count({
      where: { userId, status: TaskStatus.COMPLETED },
    });

    const inProgress = await this.taskRepository.count({
      where: { userId, status: TaskStatus.IN_PROGRESS },
    });

    const todo = await this.taskRepository.count({
      where: { userId, status: TaskStatus.TODO },
    });

    return {
      total,
      completed,
      inProgress,
      todo,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}

