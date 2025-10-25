import { SetMetadata } from '@nestjs/common';

/**
 * 跳过速率限制装饰器
 * 用于标记不需要速率限制的路由
 */
export const SKIP_THROTTLE_KEY = 'skipThrottle';
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);

