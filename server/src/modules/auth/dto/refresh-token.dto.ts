import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 刷新 Token DTO
 */
export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh Token 不能为空' })
  @IsString({ message: 'Refresh Token 必须是字符串' })
  refreshToken: string;
}

