import { IsString, IsOptional, IsDate, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建时间记录 DTO
 */
export class CreateTimeRecordDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number; // 持续时间（分钟）

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 开始工作 DTO
 */
export class StartWorkDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 结束工作 DTO
 */
export class EndWorkDto {
  @IsString()
  recordId: string;
}

