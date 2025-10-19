import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

/**
 * 用户管理控制器
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return await this.usersService.getUserProfile(user.id);
  }

  /**
   * 更新用户信息
   */
  @Put('profile')
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
  async getSettings(@CurrentUser() user: any) {
    return await this.usersService.getUserSettings(user.id);
  }

  /**
   * 更新用户设置
   */
  @Put('settings')
  async updateSettings(
    @CurrentUser() user: any,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return await this.usersService.updateUserSettings(user.id, updateSettingsDto);
  }
}

