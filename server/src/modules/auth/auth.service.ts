import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserSettings } from '../users/entities/user-settings.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { jwtConfig } from '../../config/jwt.config';
import { JwtPayload } from './strategies/jwt.strategy';
import { mailConfig } from '../../config/mail.config';
import {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from '../../utils/mail.util';
import * as crypto from 'crypto';

/**
 * 认证服务
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { username, email, password, nickname } = registerDto;

    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUserByUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('邮箱已被使用');
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      nickname: nickname || username,
    });

    const savedUser = await this.userRepository.save(user);

    // 创建用户默认设置
    const userSettings = this.userSettingsRepository.create({
      userId: savedUser.id,
      workDuration: 25,
      restDuration: 5,
      theme: 'AUTO',
      language: 'ZH',
    });
    await this.userSettingsRepository.save(userSettings);

    // 生成 token
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 token
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * 刷新 token
   */
  async refreshToken(refreshToken: string) {
    try {
      // 验证 refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 生成新的 token
      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('无效的 refresh token');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    return this.sanitizeUser(user);
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.secret,
        expiresIn: jwtConfig.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpiresIn,
      }),
    ]);

    return {
      token: accessToken,
      refreshToken,
    };
  }

  /**
   * 请求密码重置
   * 生成重置令牌并发送邮件
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // 即使用户不存在也返回成功消息（安全考虑，不泄露用户是否存在）
    if (!user) {
      return {
        message: '如果该邮箱已注册，你将收到密码重置邮件',
      };
    }

    // 生成随机重置令牌（32字节，转为十六进制字符串）
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 对令牌进行哈希，存储哈希值而不是原始令牌
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 设置令牌过期时间（1小时后）
    const expiresAt = new Date(Date.now() + mailConfig.resetPasswordExpires);

    // 保存到数据库
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    await this.userRepository.save(user);

    // 发送重置邮件（使用原始令牌）
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.username);
    } catch (error) {
      // 如果邮件发送失败，清除令牌
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await this.userRepository.save(user);
      throw new BadRequestException('邮件发送失败，请稍后重试');
    }

    return {
      message: '如果该邮箱已注册，你将收到密码重置邮件',
    };
  }

  /**
   * 重置密码
   * 验证令牌并更新密码
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // 对令牌进行哈希
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 查找具有有效令牌的用户
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :token', { token: hashedToken })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('重置令牌无效或已过期');
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码并清除重置令牌
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await this.userRepository.save(user);

    // 发送密码重置成功通知邮件
    try {
      await sendPasswordResetSuccessEmail(user.email, user.username);
    } catch (error) {
      // 邮件发送失败不影响主流程
      console.error('密码重置成功通知邮件发送失败:', error);
    }

    return {
      message: '密码重置成功，请使用新密码登录',
    };
  }

  /**
   * 验证重置令牌是否有效
   * 用于前端验证令牌状态
   */
  async verifyResetToken(token: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :token', { token: hashedToken })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('重置令牌无效或已过期');
    }

    return {
      valid: true,
      email: user.email,
    };
  }

  /**
   * 清理用户敏感信息
   */
  private sanitizeUser(user: User) {
    const { password, resetPasswordToken, resetPasswordExpires, ...result } =
      user;
    return result;
  }
}

