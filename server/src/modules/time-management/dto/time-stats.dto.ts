import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 时间统计查询 DTO
 */
export class TimeStatsQueryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

/**
 * 时间统计响应接口
 */
export interface TimeStatsResponse {
  totalWorkTime: number; // 总工作时间（分钟）
  totalBreakTime: number; // 总休息时间（分钟）
  totalPomodoros: number; // 总番茄钟数
  completedPomodoros: number; // 完成的番茄钟数
  abandonedPomodoros: number; // 放弃的番茄钟数
  averageWorkTime: number; // 平均每天工作时间
  records: Array<{
    date: string;
    workTime: number;
    breakTime: number;
    pomodoros: number;
  }>;
}

