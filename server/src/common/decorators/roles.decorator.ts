import { SetMetadata } from '@nestjs/common';

/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * 角色装饰器
 * 用于标记需要特定角色才能访问的路由
 * 
 * @example
 * @Roles(UserRole.ADMIN)
 * @Get('admin/users')
 * getUsers() {}
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

