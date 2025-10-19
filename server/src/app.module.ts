import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TimeManagementModule } from './modules/time-management/time-management.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true, // 使配置全局可用
      envFilePath: '.env',
    }),
    // 数据库模块
    TypeOrmModule.forRoot(databaseConfig),
    // 认证模块
    AuthModule,
    // 用户模块
    UsersModule,
    // 任务模块
    TasksModule,
    // 时间管理模块
    TimeManagementModule,
    // 统计模块
    StatisticsModule,
    // 通知模块
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局启用 JWT 守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
