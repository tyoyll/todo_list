import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TimeManagementService } from './time-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateTimeRecordDto,
  StartWorkDto,
  EndWorkDto,
} from './dto/create-time-record.dto';
import {
  StartPomodoroDto,
  CompletePomodoroDto,
  AbandonPomodoroDto,
} from './dto/pomodoro.dto';
import { TimeStatsQueryDto } from './dto/time-stats.dto';

/**
 * 时间管理控制器
 */
@Controller('time-management')
@UseGuards(JwtAuthGuard)
export class TimeManagementController {
  constructor(
    private readonly timeManagementService: TimeManagementService,
  ) {}

  /**
   * 开始工作
   */
  @Post('work/start')
  async startWork(@CurrentUser() user: any, @Body() startWorkDto: StartWorkDto) {
    return await this.timeManagementService.startWork(user.id, startWorkDto);
  }

  /**
   * 结束工作
   */
  @Post('work/end')
  async endWork(@CurrentUser() user: any, @Body() endWorkDto: EndWorkDto) {
    return await this.timeManagementService.endWork(user.id, endWorkDto);
  }

  /**
   * 创建时间记录
   */
  @Post('records')
  async createTimeRecord(
    @CurrentUser() user: any,
    @Body() createDto: CreateTimeRecordDto,
  ) {
    return await this.timeManagementService.createTimeRecord(
      user.id,
      createDto,
    );
  }

  /**
   * 获取时间记录列表
   */
  @Get('records')
  async getTimeRecords(
    @CurrentUser() user: any,
    @Query() query: TimeStatsQueryDto,
  ) {
    return await this.timeManagementService.getTimeRecords(user.id, query);
  }

  /**
   * 开始番茄钟
   */
  @Post('pomodoro/start')
  async startPomodoro(
    @CurrentUser() user: any,
    @Body() startDto: StartPomodoroDto,
  ) {
    return await this.timeManagementService.startPomodoro(user.id, startDto);
  }

  /**
   * 完成番茄钟
   */
  @Patch('pomodoro/complete')
  async completePomodoro(
    @CurrentUser() user: any,
    @Body() completeDto: CompletePomodoroDto,
  ) {
    return await this.timeManagementService.completePomodoro(
      user.id,
      completeDto,
    );
  }

  /**
   * 放弃番茄钟
   */
  @Patch('pomodoro/abandon')
  async abandonPomodoro(
    @CurrentUser() user: any,
    @Body() abandonDto: AbandonPomodoroDto,
  ) {
    return await this.timeManagementService.abandonPomodoro(
      user.id,
      abandonDto,
    );
  }

  /**
   * 获取番茄钟记录列表
   */
  @Get('pomodoro/records')
  async getPomodoroRecords(
    @CurrentUser() user: any,
    @Query() query: TimeStatsQueryDto,
  ) {
    return await this.timeManagementService.getPomodoroRecords(user.id, query);
  }

  /**
   * 获取时间统计
   */
  @Get('stats')
  async getTimeStats(
    @CurrentUser() user: any,
    @Query() query: TimeStatsQueryDto,
  ) {
    return await this.timeManagementService.getTimeStats(user.id, query);
  }

  /**
   * 获取每日统计
   */
  @Get('stats/daily')
  async getDailyStats(
    @CurrentUser() user: any,
    @Query('date') dateStr: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return await this.timeManagementService.getDailyStats(user.id, date);
  }

  /**
   * 获取每周统计
   */
  @Get('stats/weekly')
  async getWeeklyStats(
    @CurrentUser() user: any,
    @Query('date') dateStr: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return await this.timeManagementService.getWeeklyStats(user.id, date);
  }

  /**
   * 获取每月统计
   */
  @Get('stats/monthly')
  async getMonthlyStats(
    @CurrentUser() user: any,
    @Query('date') dateStr: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return await this.timeManagementService.getMonthlyStats(user.id, date);
  }
}

