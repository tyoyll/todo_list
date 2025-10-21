import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserSettings } from '../users/entities/user-settings.entity';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as passwordUtil from '../../utils/password.util';
import * as mailUtil from '../../utils/mail.util';
import * as crypto from 'crypto';

// Mock邮件工具
jest.mock('../../utils/mail.util');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let userSettingsRepository: any;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    nickname: 'Test User',
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserSettingsRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserSettings),
          useValue: mockUserSettingsRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    userSettingsRepository = module.get(getRepositoryToken(UserSettings));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserSettingsRepository.create.mockReturnValue({});
      mockUserSettingsRepository.save.mockResolvedValue({});
      mockJwtService.signAsync.mockResolvedValue('token');

      jest.spyOn(passwordUtil, 'hashPassword').mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // 检查用户名和邮箱
      expect(mockUserSettingsRepository.create).toHaveBeenCalled();
      expect(mockUserSettingsRepository.save).toHaveBeenCalled();
    });

    it('应该在用户名已存在时抛出异常', async () => {
      const registerDto = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        '用户名已存在',
      );
    });

    it('应该在邮箱已存在时抛出异常', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // 用户名不存在
        .mockResolvedValueOnce(mockUser); // 邮箱已存在

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        '邮箱已被使用',
      );
    });

    it('应该使用用户名作为默认昵称', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const createdUser = { ...mockUser, nickname: 'newuser' };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockUserSettingsRepository.create.mockReturnValue({});
      mockUserSettingsRepository.save.mockResolvedValue({});
      mockJwtService.signAsync.mockResolvedValue('token');

      jest.spyOn(passwordUtil, 'hashPassword').mockResolvedValue('hashedPassword');

      await service.register(registerDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nickname: 'newuser',
        }),
      );
    });
  });

  describe('login', () => {
    it('应该成功登录', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');

      jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: loginDto.username },
      });
    });

    it('应该在用户不存在时抛出异常', async () => {
      const loginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '用户名或密码错误',
      );
    });

    it('应该在密码错误时抛出异常', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '用户名或密码错误',
      );
    });
  });

  describe('refreshToken', () => {
    it('应该成功刷新token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: '1', username: 'testuser', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        refreshToken,
        expect.any(Object),
      );
    });

    it('应该在refresh token无效时抛出异常', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        '无效的 refresh token',
      );
    });

    it('应该在用户不存在时抛出异常', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: '999', username: 'testuser', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('应该成功获取当前用户信息', async () => {
      const userId = '1';

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(userId);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('resetPasswordToken');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
    });

    it('应该在用户不存在时抛出异常', async () => {
      const userId = '999';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getCurrentUser(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('应该成功发送密码重置邮件', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (mailUtil.sendPasswordResetEmail as jest.Mock).mockResolvedValue(true);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.message).toBe('如果该邮箱已注册，你将收到密码重置邮件');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mailUtil.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('应该在邮箱不存在时返回成功消息（安全考虑）', async () => {
      const forgotPasswordDto = { email: 'nonexistent@example.com' };

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.message).toBe('如果该邮箱已注册，你将收到密码重置邮件');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('应该在邮件发送失败时清除令牌并抛出异常', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (mailUtil.sendPasswordResetEmail as jest.Mock).mockRejectedValue(
        new Error('Mail service error'),
      );

      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      // 应该调用save两次：一次设置token，一次清除token
      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置密码', async () => {
      const resetPasswordDto = {
        token: 'valid-token',
        newPassword: 'newPassword123',
      };

      const userWithToken = {
        ...mockUser,
        resetPasswordToken: crypto
          .createHash('sha256')
          .update('valid-token')
          .digest('hex'),
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(userWithToken),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockUserRepository.save.mockResolvedValue(userWithToken);
      (mailUtil.sendPasswordResetSuccessEmail as jest.Mock).mockResolvedValue(true);

      jest.spyOn(passwordUtil, 'hashPassword').mockResolvedValue('newHashedPassword');

      const result = await service.resetPassword(resetPasswordDto);

      expect(result.message).toBe('密码重置成功，请使用新密码登录');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(passwordUtil.hashPassword).toHaveBeenCalledWith('newPassword123');
    });

    it('应该在令牌无效时抛出异常', async () => {
      const resetPasswordDto = {
        token: 'invalid-token',
        newPassword: 'newPassword123',
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        '重置令牌无效或已过期',
      );
    });
  });

  describe('verifyResetToken', () => {
    it('应该验证有效的重置令牌', async () => {
      const token = 'valid-token';
      const userWithToken = {
        ...mockUser,
        resetPasswordToken: crypto
          .createHash('sha256')
          .update(token)
          .digest('hex'),
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(userWithToken),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.verifyResetToken(token);

      expect(result.valid).toBe(true);
      expect(result.email).toBe(mockUser.email);
    });

    it('应该在令牌无效时抛出异常', async () => {
      const token = 'invalid-token';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.verifyResetToken(token)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

