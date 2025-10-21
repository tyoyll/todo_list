import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserSettings } from './entities/user-settings.entity';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as passwordUtil from '../../utils/password.util';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let userSettingsRepository: any;

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    nickname: 'Test User',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserSettings = {
    id: '1',
    userId: '1',
    workDuration: 25,
    restDuration: 5,
    theme: 'AUTO',
    language: 'ZH',
    enableNotifications: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserSettingsRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserSettings),
          useValue: mockUserSettingsRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    userSettingsRepository = module.get(getRepositoryToken(UserSettings));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('应该成功获取用户信息', async () => {
      const userId = '1';

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserProfile(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.username).toBe('testuser');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'username', 'email', 'nickname', 'avatarUrl', 'createdAt', 'updatedAt'],
      });
    });

    it('应该在用户不存在时抛出异常', async () => {
      const userId = '999';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserProfile(userId)).rejects.toThrow(
        '用户不存在',
      );
    });
  });

  describe('updateUserProfile', () => {
    it('应该成功更新用户信息', async () => {
      const userId = '1';
      const updateUserDto = {
        nickname: 'New Nickname',
        email: 'newemail@example.com',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.findOne.mockResolvedValueOnce(null); // 邮箱检查
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.updateUserProfile(userId, updateUserDto);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('应该在用户不存在时抛出异常', async () => {
      const userId = '999';
      const updateUserDto = { nickname: 'New Name' };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserProfile(userId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('应该在邮箱已被使用时抛出异常', async () => {
      const userId = '1';
      const updateUserDto = { email: 'existing@example.com' };
      const updatedUser = { ...mockUser, email: 'test@example.com' };

      mockUserRepository.findOne
        .mockResolvedValueOnce(updatedUser) // 用户存在
        .mockResolvedValueOnce({ id: '2', email: 'existing@example.com' }); // 邮箱已被使用

      await expect(
        service.updateUserProfile(userId, updateUserDto),
      ).rejects.toThrow(ConflictException);
      
      // 重置mock以便第二次测试
      mockUserRepository.findOne
        .mockResolvedValueOnce(updatedUser)
        .mockResolvedValueOnce({ id: '2', email: 'existing@example.com' });
      
      await expect(
        service.updateUserProfile(userId, updateUserDto),
      ).rejects.toThrow('邮箱已被使用');
    });
  });

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      const userId = '1';
      const changePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(passwordUtil, 'hashPassword').mockResolvedValue('newHashedPassword');
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.changePassword(userId, changePasswordDto);

      expect(result.message).toBe('密码修改成功');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(passwordUtil.hashPassword).toHaveBeenCalledWith('newPassword123');
    });

    it('应该在用户不存在时抛出异常', async () => {
      const userId = '999';
      const changePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('应该在旧密码错误时抛出异常', async () => {
      const userId = '1';
      const changePasswordDto = {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValue(false);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow('旧密码不正确');
    });
  });

  describe('getUserSettings', () => {
    it('应该成功获取用户设置', async () => {
      const userId = '1';

      mockUserSettingsRepository.findOne.mockResolvedValue(mockUserSettings);

      const result = await service.getUserSettings(userId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.workDuration).toBe(25);
      expect(mockUserSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('应该在设置不存在时抛出异常', async () => {
      const userId = '999';

      mockUserSettingsRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserSettings(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserSettings(userId)).rejects.toThrow(
        '用户设置不存在',
      );
    });
  });

  describe('updateUserSettings', () => {
    it('应该成功更新用户设置', async () => {
      const userId = '1';
      const updateSettingsDto = {
        workDuration: 30,
        restDuration: 10,
        theme: 'DARK' as any,
      };

      mockUserSettingsRepository.findOne.mockResolvedValue(mockUserSettings);
      mockUserSettingsRepository.save.mockResolvedValue({
        ...mockUserSettings,
        ...updateSettingsDto,
      });

      const result = await service.updateUserSettings(userId, updateSettingsDto);

      expect(result).toBeDefined();
      expect(result.workDuration).toBe(30);
      expect(mockUserSettingsRepository.save).toHaveBeenCalled();
    });

    it('应该在设置不存在时创建默认设置', async () => {
      const userId = '1';
      const updateSettingsDto = {
        workDuration: 30,
      };

      mockUserSettingsRepository.findOne.mockResolvedValue(null);
      mockUserSettingsRepository.create.mockReturnValue({
        userId,
        workDuration: 25,
        restDuration: 5,
        theme: 'AUTO',
        language: 'ZH',
      });
      mockUserSettingsRepository.save.mockResolvedValue({
        userId,
        workDuration: 30,
        restDuration: 5,
        theme: 'AUTO',
        language: 'ZH',
      });

      const result = await service.updateUserSettings(userId, updateSettingsDto);

      expect(result).toBeDefined();
      expect(mockUserSettingsRepository.create).toHaveBeenCalled();
      expect(mockUserSettingsRepository.save).toHaveBeenCalled();
    });
  });
});

