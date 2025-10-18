import { createConnection } from 'typeorm';
import { databaseConfig } from '../../config/database.config';
import { User } from '../../modules/users/entities/user.entity';
import { UserSettings } from '../../modules/users/entities/user-settings.entity';
import { Task } from '../../modules/tasks/entities/task.entity';
import { hashPassword } from '../../utils/password.util';

/**
 * 数据库种子数据脚本
 * 用于初始化测试数据
 */
async function seed() {
  try {
    // 创建数据库连接
    const connection = await createConnection({
      ...databaseConfig,
      synchronize: false, // 不自动同步数据库结构
    } as any);

    console.log('数据库连接成功');
    console.log('开始插入种子数据...');

    // 创建测试用户
    const adminPassword = await hashPassword('admin123');
    const testPassword = await hashPassword('test123');

    const adminUser = new User();
    adminUser.username = 'admin';
    adminUser.email = 'admin@example.com';
    adminUser.password = adminPassword;
    adminUser.nickname = '管理员';
    adminUser.theme = 'light';
    adminUser.notificationsEnabled = true;

    const testUser = new User();
    testUser.username = 'test';
    testUser.email = 'test@example.com';
    testUser.password = testPassword;
    testUser.nickname = '测试用户';
    testUser.theme = 'dark';
    testUser.notificationsEnabled = true;

    // 保存用户
    const savedAdminUser = await connection.manager.save(adminUser);
    const savedTestUser = await connection.manager.save(testUser);
    console.log('用户数据已创建');

    // 创建用户设置
    const adminSettings = new UserSettings();
    adminSettings.userId = savedAdminUser.id;
    adminSettings.workDuration = 25;
    adminSettings.restDuration = 5;
    adminSettings.theme = 'AUTO';
    adminSettings.language = 'ZH';

    const testSettings = new UserSettings();
    testSettings.userId = savedTestUser.id;
    testSettings.workDuration = 30;
    testSettings.restDuration = 10;
    testSettings.theme = 'DARK';
    testSettings.language = 'EN';

    // 保存用户设置
    await connection.manager.save(adminSettings);
    await connection.manager.save(testSettings);
    console.log('用户设置数据已创建');

    // 创建测试任务
    const task1 = new Task();
    task1.userId = savedAdminUser.id;
    task1.title = '完成项目架构设计';
    task1.description = '设计整个项目的架构，包括数据库结构、API设计等';
    task1.priority = 'HIGH';
    task1.status = 'IN_PROGRESS';
    task1.category = '项目规划';
    task1.tags = ['架构', '设计', '重要'];
    task1.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后
    task1.estimatedDuration = 480; // 8小时

    const task2 = new Task();
    task2.userId = savedAdminUser.id;
    task2.title = '实现用户认证模块';
    task2.description = '实现用户登录、注册、密码重置等功能';
    task2.priority = 'MEDIUM';
    task2.status = 'TODO';
    task2.category = '后端开发';
    task2.tags = ['认证', '安全'];
    task2.dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3天后
    task2.estimatedDuration = 360; // 6小时

    const task3 = new Task();
    task3.userId = savedTestUser.id;
    task3.title = '设计登录页面';
    task3.description = '设计并实现用户登录页面';
    task3.priority = 'MEDIUM';
    task3.status = 'TODO';
    task3.category = '前端开发';
    task3.tags = ['UI', '设计'];
    task3.dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2天后
    task3.estimatedDuration = 240; // 4小时

    // 保存任务
    await connection.manager.save([task1, task2, task3]);
    console.log('任务数据已创建');

    // 关闭连接
    await connection.close();
    console.log('种子数据插入完成');
    process.exit(0);
  } catch (error) {
    console.error('种子数据插入失败:', error);
    process.exit(1);
  }
}

// 执行种子数据脚本
seed();
