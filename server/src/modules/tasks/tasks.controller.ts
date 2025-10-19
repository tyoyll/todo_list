import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { CreateTaskNoteDto } from './dto/create-task-note.dto';

/**
 * 任务管理控制器
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * 创建任务
   */
  @Post()
  async createTask(
    @CurrentUser() user: any,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.tasksService.createTask(user.id, createTaskDto);
  }

  /**
   * 获取任务列表
   */
  @Get()
  async getTasks(
    @CurrentUser() user: any,
    @Query() queryTaskDto: QueryTaskDto,
  ) {
    return await this.tasksService.getTasks(user.id, queryTaskDto);
  }

  /**
   * 获取任务统计
   */
  @Get('stats')
  async getTaskStats(@CurrentUser() user: any) {
    return await this.tasksService.getTaskStats(user.id);
  }

  /**
   * 获取任务详情
   */
  @Get(':id')
  async getTask(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.getTaskById(user.id, taskId);
  }

  /**
   * 更新任务
   */
  @Put(':id')
  async updateTask(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.tasksService.updateTask(user.id, taskId, updateTaskDto);
  }

  /**
   * 删除任务
   */
  @Delete(':id')
  async deleteTask(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.deleteTask(user.id, taskId);
  }

  /**
   * 更改任务状态
   */
  @Patch(':id/status')
  async updateTaskStatus(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @Body('status') status: TaskStatus,
  ) {
    return await this.tasksService.updateTaskStatus(user.id, taskId, status);
  }

  /**
   * 添加任务笔记
   */
  @Post(':id/notes')
  async addTaskNote(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @Body() createTaskNoteDto: CreateTaskNoteDto,
  ) {
    return await this.tasksService.addTaskNote(
      user.id,
      taskId,
      createTaskNoteDto,
    );
  }

  /**
   * 获取任务笔记列表
   */
  @Get(':id/notes')
  async getTaskNotes(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.getTaskNotes(user.id, taskId);
  }

  /**
   * 删除任务笔记
   */
  @Delete(':id/notes/:noteId')
  async deleteTaskNote(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @Param('noteId') noteId: string,
  ) {
    return await this.tasksService.deleteTaskNote(user.id, taskId, noteId);
  }

  /**
   * 上传任务附件
   */
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.tasksService.addAttachment(user.id, taskId, file);
  }

  /**
   * 获取任务附件列表
   */
  @Get(':id/attachments')
  async getAttachments(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.getAttachments(user.id, taskId);
  }

  /**
   * 删除任务附件
   */
  @Delete(':id/attachments/:attachmentId')
  async deleteAttachment(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return await this.tasksService.deleteAttachment(
      user.id,
      taskId,
      attachmentId,
    );
  }
}

