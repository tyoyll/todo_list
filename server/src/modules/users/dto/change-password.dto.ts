import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 修改密码 DTO
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'oldPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: '旧密码至少需要6个字符' })
  oldPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: '新密码至少需要6个字符' })
  newPassword: string;
}

