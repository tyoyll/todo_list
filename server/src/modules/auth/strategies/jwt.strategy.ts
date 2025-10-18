import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../../config/jwt.config';

/**
 * JWT Payload 接口
 */
export interface JwtPayload {
  sub: string; // 用户ID
  username: string;
  email: string;
}

/**
 * JWT 认证策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * 验证 JWT token
   * Passport 会自动调用此方法来验证token
   */
  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('无效的token');
    }

    // 返回的数据会被附加到 request.user
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}

