import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 忘记密码 DTO
 */
export class ForgotPasswordDto {
  @ApiProperty({
    description: '注册邮箱地址',
    example: 'test@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}

