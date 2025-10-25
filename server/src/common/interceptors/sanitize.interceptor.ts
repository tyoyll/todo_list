import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 数据净化拦截器
 * 用于防止敏感数据泄露
 * 自动移除响应中的敏感字段
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  // 需要移除的敏感字段
  private sensitiveFields = [
    'password',
    'passwordHash',
    'refreshToken',
    'resetPasswordToken',
    'apiKey',
    'secret',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.sanitize(data)),
    );
  }

  /**
   * 递归净化数据
   */
  private sanitize(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // 数组
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    // 对象
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      // 移除敏感字段
      for (const field of this.sensitiveFields) {
        if (field in sanitized) {
          delete sanitized[field];
        }
      }
      
      // 递归处理嵌套对象
      for (const key in sanitized) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
      
      return sanitized;
    }

    return data;
  }
}

