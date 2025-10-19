import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

/**
 * 番茄钟状态枚举
 */
export enum PomodoroStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

/**
 * 番茄钟类型枚举
 */
export enum PomodoroType {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

/**
 * 开始番茄钟 DTO
 */
export class StartPomodoroDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsEnum(PomodoroType)
  type: PomodoroType;

  @IsNumber()
  @Min(1)
  @Max(120)
  duration: number; // 预计时长（分钟）

  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * 完成番茄钟 DTO
 */
export class CompletePomodoroDto {
  @IsString()
  pomodoroId: string;
}

/**
 * 放弃番茄钟 DTO
 */
export class AbandonPomodoroDto {
  @IsString()
  pomodoroId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

