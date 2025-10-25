import { SetMetadata } from '@nestjs/common';

/**
 * 缓存键装饰器
 * 用于设置缓存键前缀
 */
export const CACHE_KEY = 'cache_key';
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY, key);

/**
 * 缓存TTL装饰器
 * 用于设置缓存过期时间（秒）
 */
export const CACHE_TTL = 'cache_ttl';
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL, ttl);

