import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

/**
 * 用户管理控制器
 */
@ApiTags('用户')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @ApiOperation({
    summary: '获取用户资料',
    description: '获取当前登录用户的详细资料信息',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取用户资料',
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
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getProfile(@CurrentUser() user: any) {
    return await this.usersService.getUserProfile(user.id);
  }

  /**
   * 更新用户信息
   */
  @Put('profile')
  @ApiOperation({
    summary: '更新用户资料',
    description: '更新当前登录用户的资料信息',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: '成功更新用户资料',
    schema: {
      example: {
        id: '1',
        username: 'testuser',
        email: 'newemail@example.com',
        nickname: 'New Nickname',
        avatarUrl: 'https://example.com/avatar.jpg',
        updatedAt: '2025-10-21T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '邮箱已被其他用户使用' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUserProfile(user.id, updateUserDto);
  }

  /**
   * 修改密码
   */
  @Patch('password')
  @ApiOperation({
    summary: '修改密码',
    description: '修改当前登录用户的密码',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: '密码修改成功',
    schema: {
      example: {
        message: '密码修改成功',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 400, description: '旧密码不正确' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.usersService.changePassword(user.id, changePasswordDto);
  }

  /**
   * 获取用户设置
   */
  @Get('settings')
  @ApiOperation({
    summary: '获取用户设置',
    description: '获取当前登录用户的个性化设置',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取用户设置',
    schema: {
      example: {
        id: '1',
        userId: '1',
        workDuration: 25,
        restDuration: 5,
        theme: 'AUTO',
        language: 'ZH',
        enableNotifications: true,
        createdAt: '2025-10-21T10:00:00.000Z',
        updatedAt: '2025-10-21T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户设置不存在' })
  async getSettings(@CurrentUser() user: any) {
    return await this.usersService.getUserSettings(user.id);
  }

  /**
   * 更新用户设置
   */
  @Put('settings')
  @ApiOperation({
    summary: '更新用户设置',
    description: '更新当前登录用户的个性化设置',
  })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({
    status: 200,
    description: '成功更新用户设置',
    schema: {
      example: {
        id: '1',
        userId: '1',
        workDuration: 30,
        restDuration: 10,
        theme: 'DARK',
        language: 'EN',
        enableNotifications: false,
        updatedAt: '2025-10-21T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async updateSettings(
    @CurrentUser() user: any,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return await this.usersService.updateUserSettings(user.id, updateSettingsDto);
  }
}

