import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from './create-task.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新任务 DTO
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    description: '任务状态',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: '状态选项无效' })
  status?: TaskStatus;
}

