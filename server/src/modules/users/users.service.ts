import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSettings } from './entities/user-settings.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { hashPassword, comparePassword } from '../../utils/password.util';

/**
 * 用户服务
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
  ) {}

  /**
   * 获取用户信息
   */
  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'nickname', 'avatarUrl', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户信息
   */
  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查邮箱是否被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    // 更新用户信息
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    // 返回更新后的用户信息（不包含密码）
    const { password, ...result } = user;
    return result;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isOldPasswordValid = await comparePassword(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('旧密码不正确');
    }

    // 加密新密码
    const hashedPassword = await hashPassword(changePasswordDto.newPassword);

    // 更新密码
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      message: '密码修改成功',
    };
  }

  /**
   * 获取用户设置
   */
  async getUserSettings(userId: string) {
    const settings = await this.userSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      throw new NotFoundException('用户设置不存在');
    }

    return settings;
  }

  /**
   * 更新用户设置
   */
  async updateUserSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    let settings = await this.userSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // 如果设置不存在，创建默认设置
      settings = this.userSettingsRepository.create({
        userId,
        workDuration: 25,
        restDuration: 5,
        theme: 'AUTO',
        language: 'ZH',
      });
    }

    // 更新设置
    Object.assign(settings, updateSettingsDto);
    await this.userSettingsRepository.save(settings);

    return settings;
  }
}

