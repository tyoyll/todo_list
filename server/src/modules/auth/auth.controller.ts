import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
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
@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   */
  @Public()
  @Post('register')
  @ApiOperation({
    summary: '用户注册',
    description: '创建新用户账号，注册成功后自动登录并返回JWT token',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '注册成功，返回用户信息和token',
    schema: {
      example: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          nickname: 'Test User',
          createdAt: '2025-10-21T10:00:00.000Z',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  @ApiResponse({ status: 400, description: '请求参数验证失败' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * 用户登录
   */
  @Public()
  @Post('login')
  @ApiOperation({
    summary: '用户登录',
    description: '使用用户名和密码登录，返回JWT token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功，返回用户信息和token',
    schema: {
      example: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          nickname: 'Test User',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * 刷新 token
   */
  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: '刷新访问令牌',
    description: '使用refresh token获取新的access token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: '刷新成功，返回新的token',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token无效或已过期' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * 获取当前用户信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '根据JWT token获取当前登录用户的详细信息',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取用户信息',
    schema: {
      example: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        nickname: 'Test User',
        avatarUrl: null,
        createdAt: '2025-10-21T10:00:00.000Z',
        updatedAt: '2025-10-21T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，token无效或已过期' })
  async getCurrentUser(@CurrentUser() user: any) {
    return await this.authService.getCurrentUser(user.id);
  }

  /**
   * 登出（客户端负责清除token）
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '用户登出',
    description: '登出当前用户（客户端需清除本地存储的token）',
  })
  @ApiResponse({
    status: 200,
    description: '登出成功',
    schema: {
      example: {
        message: '登出成功',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiOperation({
    summary: '请求密码重置',
    description: '发送密码重置邮件到指定邮箱',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: '邮件发送成功（无论邮箱是否存在都返回此消息）',
    schema: {
      example: {
        message: '如果该邮箱已注册，你将收到密码重置邮件',
      },
    },
  })
  @ApiResponse({ status: 400, description: '邮件发送失败' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * 重置密码
   * 使用重置令牌更新密码
   */
  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: '重置密码',
    description: '使用重置令牌设置新密码',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: '密码重置成功',
    schema: {
      example: {
        message: '密码重置成功，请使用新密码登录',
      },
    },
  })
  @ApiResponse({ status: 400, description: '重置令牌无效或已过期' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * 验证重置令牌
   * 检查令牌是否有效
   */
  @Public()
  @Get('verify-reset-token')
  @ApiOperation({
    summary: '验证重置令牌',
    description: '检查密码重置令牌是否有效',
  })
  @ApiQuery({
    name: 'token',
    description: '密码重置令牌',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '令牌有效',
    schema: {
      example: {
        valid: true,
        email: 'test@example.com',
      },
    },
  })
  @ApiResponse({ status: 400, description: '令牌无效或已过期' })
  async verifyResetToken(@Query('token') token: string) {
    return await this.authService.verifyResetToken(token);
  }
}

