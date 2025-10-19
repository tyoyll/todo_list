import { IsOptional, IsEnum, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from './create-task.dto';

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
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(TaskStatus, { message: '状态选项无效' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: '优先级选项无效' })
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskSortField, { message: '排序字段无效' })
  sortBy?: TaskSortField = TaskSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder, { message: '排序方向无效' })
  sortOrder?: SortOrder = SortOrder.DESC;
}

