import { IsOptional, IsEnum, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from './create-task.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 任务排序字段枚举
 */
export enum TaskSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  TITLE = 'title',
}

/**
 * 排序方向枚举
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * 查询任务列表 DTO
 */
export class QueryTaskDto {
  @ApiPropertyOptional({
    description: '页码',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    minimum: 1,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '任务状态筛选',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: '状态选项无效' })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: '任务优先级筛选',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: '优先级选项无效' })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: '任务分类筛选',
    example: '工作',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '搜索关键词（搜索标题和描述）',
    example: '文档',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    enum: TaskSortField,
    default: TaskSortField.CREATED_AT,
    example: TaskSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(TaskSortField, { message: '排序字段无效' })
  sortBy?: TaskSortField = TaskSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: '排序方向',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: '排序方向无效' })
  sortOrder?: SortOrder = SortOrder.DESC;
}

