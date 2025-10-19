import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

/**
 * 更新用户信息 DTO
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '昵称至少需要2个字符' })
  @MaxLength(100, { message: '昵称最多100个字符' })
  nickname?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

