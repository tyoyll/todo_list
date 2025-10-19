import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

/**
 * 通知类型枚举
 */
export enum NotificationType {
  TASK_DEADLINE = 'TASK_DEADLINE',
  TASK_OVERDUE = 'TASK_OVERDUE',
  REST_REMINDER = 'REST_REMINDER',
  IMPORTANT_TASK = 'IMPORTANT_TASK',
  SYSTEM = 'SYSTEM',
}

/**
 * 创建通知DTO
 */
export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  link?: string;
}

/**
 * 标记已读DTO
 */
export class MarkReadDto {
  @IsString()
  notificationId: string;
}

/**
 * 批量标记已读DTO
 */
export class MarkAllReadDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}

