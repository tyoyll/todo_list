import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新用户信息 DTO
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '用户昵称',
    example: 'Updated User',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '昵称至少需要2个字符' })
  @MaxLength(100, { message: '昵称最多100个字符' })
  nickname?: string;

  @ApiPropertyOptional({
    description: '用户邮箱',
    example: 'newemail@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

