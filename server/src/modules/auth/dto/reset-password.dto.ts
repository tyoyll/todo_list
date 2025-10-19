import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

/**
 * 重置密码 DTO
 */
export class ResetPasswordDto {
  @IsString({ message: '重置令牌必须是字符串' })
  @IsNotEmpty({ message: '重置令牌不能为空' })
  token: string;

  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少为6个字符' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/, {
    message: '密码必须包含字母和数字',
  })
  newPassword: string;
}

