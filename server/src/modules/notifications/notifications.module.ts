import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { Task } from '../tasks/entities/task.entity';
import { TimeRecord } from '../time-management/entities/time-record.entity';

/**
 * 通知模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Task, TimeRecord]),
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

