/**
 * 日志工具类
 * 提供统一的日志记录功能
 */
export class LoggerUtil {
  /**
   * 记录信息日志
   */
  static info(message: string, context?: string, data?: any) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    console.log(`${timestamp} ${contextStr} INFO: ${message}`, data || '');
  }

  /**
   * 记录错误日志
   */
  static error(message: string, error?: Error, context?: string) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    console.error(`${timestamp} ${contextStr} ERROR: ${message}`, error || '');
  }

  /**
   * 记录警告日志
   */
  static warn(message: string, context?: string, data?: any) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    console.warn(`${timestamp} ${contextStr} WARN: ${message}`, data || '');
  }

  /**
   * 记录调试日志
   */
  static debug(message: string, context?: string, data?: any) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    console.debug(`${timestamp} ${contextStr} DEBUG: ${message}`, data || '');
  }
}
