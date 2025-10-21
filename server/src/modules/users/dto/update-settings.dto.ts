import { IsOptional, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional({
    description: '界面主题',
    enum: Theme,
    example: Theme.AUTO,
  })
  @IsOptional()
  @IsEnum(Theme, { message: '主题选项无效' })
  theme?: Theme;

  @ApiPropertyOptional({
    description: '界面语言',
    enum: Language,
    example: Language.ZH,
  })
  @IsOptional()
  @IsEnum(Language, { message: '语言选项无效' })
  language?: Language;

  @ApiPropertyOptional({
    description: '是否启用通知',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: '是否启用邮件通知',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    description: '工作时长（分钟）',
    minimum: 1,
    maximum: 120,
    example: 25,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '工作时长至少为1分钟' })
  @Max(120, { message: '工作时长最多为120分钟' })
  workDuration?: number;

  @ApiPropertyOptional({
    description: '休息时长（分钟）',
    minimum: 1,
    maximum: 60,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '休息时长至少为1分钟' })
  @Max(60, { message: '休息时长最多为60分钟' })
  restDuration?: number;
}

