import { IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 报表类型枚举
 */
export enum ReportType {
  TASK_SUMMARY = 'TASK_SUMMARY',
  TIME_SUMMARY = 'TIME_SUMMARY',
  COMPLETE = 'COMPLETE',
}

/**
 * 导出格式枚举
 */
export enum ExportFormat {
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

/**
 * 导出报表 DTO
 */
export class ExportReportDto {
  @ApiPropertyOptional({
    description: '报表类型',
    enum: ReportType,
    default: ReportType.COMPLETE,
    example: ReportType.COMPLETE,
  })
  @IsOptional()
  @IsEnum(ReportType, { message: '报表类型无效' })
  reportType?: ReportType = ReportType.COMPLETE;

  @ApiPropertyOptional({
    description: '开始日期',
    type: 'string',
    format: 'date-time',
    example: '2025-10-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: '结束日期',
    type: 'string',
    format: 'date-time',
    example: '2025-10-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

