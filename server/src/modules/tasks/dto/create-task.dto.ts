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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({
    description: '任务标题',
    example: '完成项目文档',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1, { message: '任务标题不能为空' })
  @MaxLength(200, { message: '任务标题最多200个字符' })
  title: string;

  @ApiPropertyOptional({
    description: '任务描述',
    example: '编写完整的项目技术文档，包括API接口文档和部署说明',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: '任务描述最多5000个字符' })
  description?: string;

  @ApiPropertyOptional({
    description: '任务优先级',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: '优先级选项无效' })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: '任务分类',
    example: '工作',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '分类最多100个字符' })
  category?: string;

  @ApiPropertyOptional({
    description: '任务标签',
    type: [String],
    example: ['重要', '紧急'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '截止日期',
    type: 'string',
    format: 'date-time',
    example: '2025-10-25T23:59:59.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({
    description: '预计完成时长（分钟）',
    minimum: 1,
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '预计时长至少为1分钟' })
  estimatedDuration?: number;
}

