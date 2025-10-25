import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * 速率限制配置
 * 防止API滥用和DDoS攻击
 */
export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      // 默认限制：每分钟100个请求
      ttl: 60000, // 时间窗口（毫秒）
      limit: 100, // 限制次数
    },
  ],
};

/**
 * 自定义速率限制配置
 * 可用于特定路由的速率限制
 */
export const customThrottlerConfig = {
  // 登录接口：每分钟5次
  login: {
    ttl: 60000,
    limit: 5,
  },
  // 注册接口：每小时3次
  register: {
    ttl: 3600000,
    limit: 3,
  },
  // 密码重置：每小时3次
  resetPassword: {
    ttl: 3600000,
    limit: 3,
  },
  // 文件上传：每分钟10次
  fileUpload: {
    ttl: 60000,
    limit: 10,
  },
};

