import { SetMetadata } from '@nestjs/common';

/**
 * 公开路由装饰器
 * 使用此装饰器的路由不需要认证即可访问
 */
export const Public = () => SetMetadata('isPublic', true);

