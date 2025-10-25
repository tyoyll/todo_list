import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * 资源所有者守卫
 * 确保用户只能访问自己的资源
 * 
 * 使用说明：
 * 1. 路由参数中必须有 userId 或其他标识用户的参数
 * 2. 请求对象中必须有 user 信息（由 JWT 守卫注入）
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // 如果是管理员，允许访问所有资源
    if (user.role === 'admin') {
      return true;
    }

    // 检查资源所有权
    // 可以从路由参数、查询参数或请求体中获取 userId
    const resourceUserId = 
      request.params.userId || 
      request.query.userId || 
      request.body.userId;

    // 如果没有找到 userId，检查是否是用户自己的资源
    if (!resourceUserId) {
      // 对于某些路由，当前用户 ID 就是资源 ID
      return true;
    }

    // 验证资源所有权
    if (resourceUserId !== user.id) {
      throw new ForbiddenException('您无权访问此资源');
    }

    return true;
  }
}

