import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * 强密码验证器
 * 要求密码：
 * - 至少8个字符
 * - 包含大写字母
 * - 包含小写字母
 * - 包含数字
 * - 包含特殊字符
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // 至少8个字符
          if (value.length < 8) {
            return false;
          }

          // 包含大写字母
          if (!/[A-Z]/.test(value)) {
            return false;
          }

          // 包含小写字母
          if (!/[a-z]/.test(value)) {
            return false;
          }

          // 包含数字
          if (!/\d/.test(value)) {
            return false;
          }

          // 包含特殊字符
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return '密码必须至少8个字符，包含大写字母、小写字母、数字和特殊字符';
        },
      },
    });
  };
}

/**
 * 不包含SQL注入关键字
 */
export function NoSQLInjection(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'noSQLInjection',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return true;
          }

          // SQL注入关键字列表
          const sqlKeywords = [
            'SELECT',
            'INSERT',
            'UPDATE',
            'DELETE',
            'DROP',
            'CREATE',
            'ALTER',
            'EXEC',
            'EXECUTE',
            'SCRIPT',
            'UNION',
            '--',
            ';--',
            '/*',
            '*/',
            'xp_',
          ];

          const upperValue = value.toUpperCase();
          
          for (const keyword of sqlKeywords) {
            if (upperValue.includes(keyword)) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return '输入包含非法字符';
        },
      },
    });
  };
}

