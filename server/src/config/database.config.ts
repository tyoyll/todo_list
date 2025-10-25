import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置
 * 从环境变量中读取数据库连接信息
 */
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'todo_list_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // 仅在开发环境自动同步
  logging: process.env.NODE_ENV === 'development',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
  
  // 连接池配置 - 提高性能
  extra: {
    // 连接池最大连接数
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    // 连接池最小连接数
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    // 连接空闲超时时间（毫秒）
    idleTimeoutMillis: 30000,
    // 连接超时时间（毫秒）
    connectionTimeoutMillis: 2000,
  },
  
  // 查询性能优化
  cache: {
    // 启用查询缓存
    duration: 30000, // 缓存30秒
  },
};
