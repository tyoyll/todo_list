import { IsOptional, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';

/**
 * 主题枚举
 */
export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  AUTO = 'AUTO',
}

/**
 * 语言枚举
 */
export enum Language {
  ZH = 'ZH',
  EN = 'EN',
}

/**
 * 更新用户设置 DTO
 */
export class UpdateSettingsDto {
  @IsOptional()
  @IsEnum(Theme, { message: '主题选项无效' })
  theme?: Theme;

  @IsOptional()
  @IsEnum(Language, { message: '语言选项无效' })
  language?: Language;

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1, { message: '工作时长至少为1分钟' })
  @Max(120, { message: '工作时长最多为120分钟' })
  workDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: '休息时长至少为1分钟' })
  @Max(60, { message: '休息时长最多为60分钟' })
  restDuration?: number;
}

