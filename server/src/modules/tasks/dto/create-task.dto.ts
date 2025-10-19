import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsArray,
  IsInt,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

/**
 * 创建任务 DTO
 */
export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: '任务标题不能为空' })
  @MaxLength(200, { message: '任务标题最多200个字符' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: '任务描述最多5000个字符' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: '优先级选项无效' })
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '分类最多100个字符' })
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1, { message: '预计时长至少为1分钟' })
  estimatedDuration?: number;
}

