import { CacheModuleOptions } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

/**
 * Redis 缓存配置
 * 用于提高系统性能，减少数据库查询
 */
export const redisConfig: CacheModuleOptions = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  ttl: 300, // 默认缓存时间（秒）：5分钟
  max: 100, // 最大缓存项数量
  db: parseInt(process.env.REDIS_DB || '0', 10),
};

