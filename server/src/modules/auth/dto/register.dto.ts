import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 用户注册 DTO
 */
export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'testuser',
    minLength: 3,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名至少3个字符' })
  username: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'test@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  @ApiPropertyOptional({
    description: '昵称',
    example: 'Test User',
  })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  nickname?: string;
}

