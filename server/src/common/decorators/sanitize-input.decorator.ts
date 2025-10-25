import { Transform } from 'class-transformer';

/**
 * 输入净化装饰器
 * 防止XSS攻击，清理HTML标签
 */
export function SanitizeHtml() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    
    // 移除HTML标签
    return value.replace(/<[^>]*>/g, '');
  });
}

/**
 * 去除前后空格
 */
export function Trim() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.trim();
  });
}

/**
 * 转换为小写
 */
export function ToLowerCase() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.toLowerCase();
  });
}

/**
 * 转换为大写
 */
export function ToUpperCase() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.toUpperCase();
  });
}

