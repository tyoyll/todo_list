import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/common';

/**
 * API密钥守卫
 * 用于保护某些API端点需要API密钥访问
 * 
 * 使用：
 * @UseGuards(ApiKeyGuard)
 * @Get('public-api/data')
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // 从请求头获取API密钥
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey) {
      throw new UnauthorizedException('缺少API密钥');
    }
    
    // 验证API密钥（应该从数据库或配置中获取有效的密钥列表）
    const validApiKeys = (process.env.API_KEYS || '').split(',');
    
    if (!validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException('无效的API密钥');
    }
    
    return true;
  }
}

