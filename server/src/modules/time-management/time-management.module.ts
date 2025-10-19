import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeManagementController } from './time-management.controller';
import { TimeManagementService } from './time-management.service';
import { TimeRecord } from './entities/time-record.entity';
import { PomodoroRecord } from './entities/pomodoro-record.entity';

/**
 * 时间管理模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([TimeRecord, PomodoroRecord])],
  controllers: [TimeManagementController],
  providers: [TimeManagementService],
  exports: [TimeManagementService],
})
export class TimeManagementModule {}

