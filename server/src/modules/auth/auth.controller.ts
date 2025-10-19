import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * 认证控制器
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * 用户登录
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * 刷新 token
   */
  @Public()
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * 获取当前用户信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return await this.authService.getCurrentUser(user.id);
  }

  /**
   * 登出（客户端负责清除token）
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return {
      message: '登出成功',
    };
  }

  /**
   * 请求密码重置
   * 发送密码重置邮件
   */
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * 重置密码
   * 使用重置令牌更新密码
   */
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * 验证重置令牌
   * 检查令牌是否有效
   */
  @Public()
  @Get('verify-reset-token')
  async verifyResetToken(@Query('token') token: string) {
    return await this.authService.verifyResetToken(token);
  }
}

