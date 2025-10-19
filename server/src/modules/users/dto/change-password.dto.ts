import { IsString, MinLength } from 'class-validator';

/**
 * 修改密码 DTO
 */
export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: '旧密码至少需要6个字符' })
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: '新密码至少需要6个字符' })
  newPassword: string;
}

