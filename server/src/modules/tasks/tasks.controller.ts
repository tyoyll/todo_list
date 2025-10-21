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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
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
@ApiTags('任务')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * 创建任务
   */
  @Post()
  @ApiOperation({
    summary: '创建新任务',
    description: '创建一个新的待办任务',
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: '任务创建成功',
    schema: {
      example: {
        id: '1',
        title: '完成项目文档',
        description: '编写项目的技术文档',
        priority: 'HIGH',
        status: 'TODO',
        createdAt: '2025-10-21T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiOperation({
    summary: '获取任务列表',
    description: '分页获取任务列表，支持筛选、排序和搜索',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取任务列表',
    schema: {
      example: {
        data: [
          {
            id: '1',
            title: '完成项目文档',
            priority: 'HIGH',
            status: 'TODO',
            dueDate: '2025-10-25T00:00:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiOperation({
    summary: '获取任务统计',
    description: '获取用户的任务统计信息（总数、完成数等）',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取统计信息',
    schema: {
      example: {
        total: 10,
        completed: 5,
        inProgress: 3,
        todo: 2,
        completionRate: 50,
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getTaskStats(@CurrentUser() user: any) {
    return await this.tasksService.getTaskStats(user.id);
  }

  /**
   * 获取任务详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取任务详情',
    description: '获取单个任务的详细信息，包括笔记和附件',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '成功获取任务详情',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async getTask(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.getTaskById(user.id, taskId);
  }

  /**
   * 更新任务
   */
  @Put(':id')
  @ApiOperation({
    summary: '更新任务信息',
    description: '更新任务的各项信息',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: '任务更新成功',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权修改此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
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
  @ApiOperation({
    summary: '删除任务',
    description: '软删除指定的任务',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '任务删除成功',
    schema: {
      example: {
        message: '任务已删除',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权删除此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async deleteTask(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.deleteTask(user.id, taskId);
  }

  /**
   * 更改任务状态
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: '更改任务状态',
    description: '更改任务的完成状态',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
          example: 'COMPLETED',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '状态更新成功',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权修改此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
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
  @ApiOperation({
    summary: '添加任务笔记',
    description: '为指定任务添加笔记',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiBody({ type: CreateTaskNoteDto })
  @ApiResponse({
    status: 201,
    description: '笔记添加成功',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
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
  @ApiOperation({
    summary: '获取任务笔记',
    description: '获取指定任务的所有笔记',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '成功获取笔记列表',
    schema: {
      example: [
        {
          id: '1',
          taskId: '1',
          content: '这是一条笔记',
          createdAt: '2025-10-21T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async getTaskNotes(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.getTaskNotes(user.id, taskId);
  }

  /**
   * 删除任务笔记
   */
  @Delete(':id/notes/:noteId')
  @ApiOperation({
    summary: '删除任务笔记',
    description: '删除指定的任务笔记',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiParam({ name: 'noteId', description: '笔记ID' })
  @ApiResponse({
    status: 200,
    description: '笔记删除成功',
    schema: {
      example: {
        message: '笔记已删除',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问此任务' })
  @ApiResponse({ status: 404, description: '任务或笔记不存在' })
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
  @ApiOperation({
    summary: '上传任务附件',
    description: '为指定任务上传文件附件',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '要上传的文件',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '附件上传成功',
    schema: {
      example: {
        id: '1',
        taskId: '1',
        fileName: 'document.pdf',
        filePath: 'uploads/attachments/document.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        createdAt: '2025-10-21T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
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
  @ApiOperation({
    summary: '获取任务附件',
    description: '获取指定任务的所有附件',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '成功获取附件列表',
    schema: {
      example: [
        {
          id: '1',
          taskId: '1',
          fileName: 'document.pdf',
          filePath: 'uploads/attachments/document.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          createdAt: '2025-10-21T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问此任务' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async getAttachments(@CurrentUser() user: any, @Param('id') taskId: string) {
    return await this.tasksService.getAttachments(user.id, taskId);
  }

  /**
   * 删除任务附件
   */
  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({
    summary: '删除任务附件',
    description: '删除指定的任务附件',
  })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiParam({ name: 'attachmentId', description: '附件ID' })
  @ApiResponse({
    status: 200,
    description: '附件删除成功',
    schema: {
      example: {
        message: '附件已删除',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问此任务' })
  @ApiResponse({ status: 404, description: '任务或附件不存在' })
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

