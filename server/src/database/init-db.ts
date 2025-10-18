import { createConnection } from 'typeorm';
import { databaseConfig } from '../config/database.config';

/**
 * 数据库初始化脚本
 * 用于创建数据库连接并执行初始化操作
 */
async function initDatabase() {
  try {
    // 创建数据库连接
    const connection = await createConnection({
      ...databaseConfig,
      synchronize: true, // 仅在初始化时使用，生产环境应使用迁移
    } as any);

    console.log('数据库连接成功');

    // 执行初始化操作
    console.log('开始初始化数据库...');

    // 关闭连接
    await connection.close();
    console.log('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 执行初始化
initDatabase();
