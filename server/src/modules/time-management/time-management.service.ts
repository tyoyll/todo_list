import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TimeRecord } from './entities/time-record.entity';
import { PomodoroRecord } from './entities/pomodoro-record.entity';
import {
  CreateTimeRecordDto,
  StartWorkDto,
  EndWorkDto,
} from './dto/create-time-record.dto';
import {
  StartPomodoroDto,
  CompletePomodoroDto,
  AbandonPomodoroDto,
  PomodoroStatus,
} from './dto/pomodoro.dto';
import { TimeStatsQueryDto, TimeStatsResponse } from './dto/time-stats.dto';

/**
 * 时间管理服务
 */
@Injectable()
export class TimeManagementService {
  constructor(
    @InjectRepository(TimeRecord)
    private readonly timeRecordRepository: Repository<TimeRecord>,
    @InjectRepository(PomodoroRecord)
    private readonly pomodoroRepository: Repository<PomodoroRecord>,
  ) {}

  /**
   * 开始工作
   */
  async startWork(userId: string, startWorkDto: StartWorkDto) {
    // 检查是否有未结束的工作记录
    const activeRecord = await this.timeRecordRepository.findOne({
      where: {
        userId,
        endTime: null as any,
      },
    });

    if (activeRecord) {
      throw new BadRequestException('已有正在进行的工作记录，请先结束');
    }

    const record = this.timeRecordRepository.create({
      userId,
      taskId: startWorkDto.taskId,
      startTime: new Date(),
      description: startWorkDto.description,
    });

    return await this.timeRecordRepository.save(record);
  }

  /**
   * 结束工作
   */
  async endWork(userId: string, endWorkDto: EndWorkDto) {
    const record = await this.timeRecordRepository.findOne({
      where: {
        id: endWorkDto.recordId,
        userId,
      },
    });

    if (!record) {
      throw new NotFoundException('工作记录不存在');
    }

    if (record.endTime) {
      throw new BadRequestException('该工作记录已结束');
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - record.startTime.getTime()) / 1000 / 60,
    );

    record.endTime = endTime;
    record.duration = duration;

    return await this.timeRecordRepository.save(record);
  }

  /**
   * 创建时间记录（手动）
   */
  async createTimeRecord(userId: string, createDto: CreateTimeRecordDto) {
    let duration = createDto.duration;

    if (!duration && createDto.endTime) {
      duration = Math.floor(
        (createDto.endTime.getTime() - createDto.startTime.getTime()) /
          1000 /
          60,
      );
    }

    const record = this.timeRecordRepository.create({
      userId,
      ...createDto,
      duration,
    });

    return await this.timeRecordRepository.save(record);
  }

  /**
   * 获取时间记录列表
   */
  async getTimeRecords(userId: string, query: TimeStatsQueryDto) {
    const where: any = { userId };

    if (query.startDate && query.endDate) {
      where.startTime = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      where.startTime = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      where.startTime = LessThanOrEqual(query.endDate);
    }

    return await this.timeRecordRepository.find({
      where,
      order: { startTime: 'DESC' },
      relations: ['task'],
    });
  }

  /**
   * 开始番茄钟
   */
  async startPomodoro(userId: string, startDto: StartPomodoroDto) {
    // 检查是否有正在进行的番茄钟
    const activePomodoro = await this.pomodoroRepository.findOne({
      where: {
        userId,
        status: PomodoroStatus.IN_PROGRESS,
      },
    });

    if (activePomodoro) {
      throw new BadRequestException('已有正在进行的番茄钟，请先完成或放弃');
    }

    const pomodoro = this.pomodoroRepository.create({
      userId,
      taskId: startDto.taskId,
      type: startDto.type,
      plannedDuration: startDto.duration,
      startTime: new Date(),
      status: PomodoroStatus.IN_PROGRESS,
      note: startDto.note,
    });

    return await this.pomodoroRepository.save(pomodoro);
  }

  /**
   * 完成番茄钟
   */
  async completePomodoro(userId: string, completeDto: CompletePomodoroDto) {
    const pomodoro = await this.pomodoroRepository.findOne({
      where: {
        id: completeDto.pomodoroId,
        userId,
      },
    });

    if (!pomodoro) {
      throw new NotFoundException('番茄钟记录不存在');
    }

    if (pomodoro.status !== PomodoroStatus.IN_PROGRESS) {
      throw new BadRequestException('该番茄钟已结束');
    }

    const endTime = new Date();
    const actualDuration = Math.floor(
      (endTime.getTime() - pomodoro.startTime.getTime()) / 1000 / 60,
    );

    pomodoro.endTime = endTime;
    pomodoro.actualDuration = actualDuration;
    pomodoro.status = PomodoroStatus.COMPLETED;

    return await this.pomodoroRepository.save(pomodoro);
  }

  /**
   * 放弃番茄钟
   */
  async abandonPomodoro(userId: string, abandonDto: AbandonPomodoroDto) {
    const pomodoro = await this.pomodoroRepository.findOne({
      where: {
        id: abandonDto.pomodoroId,
        userId,
      },
    });

    if (!pomodoro) {
      throw new NotFoundException('番茄钟记录不存在');
    }

    if (pomodoro.status !== PomodoroStatus.IN_PROGRESS) {
      throw new BadRequestException('该番茄钟已结束');
    }

    const endTime = new Date();
    const actualDuration = Math.floor(
      (endTime.getTime() - pomodoro.startTime.getTime()) / 1000 / 60,
    );

    pomodoro.endTime = endTime;
    pomodoro.actualDuration = actualDuration;
    pomodoro.status = PomodoroStatus.ABANDONED;
    if (abandonDto.reason) {
      pomodoro.note = `${pomodoro.note || ''}\n放弃原因: ${abandonDto.reason}`;
    }

    return await this.pomodoroRepository.save(pomodoro);
  }

  /**
   * 获取番茄钟列表
   */
  async getPomodoroRecords(userId: string, query: TimeStatsQueryDto) {
    const where: any = { userId };

    if (query.startDate && query.endDate) {
      where.startTime = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      where.startTime = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      where.startTime = LessThanOrEqual(query.endDate);
    }

    return await this.pomodoroRepository.find({
      where,
      order: { startTime: 'DESC' },
      relations: ['task'],
    });
  }

  /**
   * 获取时间统计
   */
  async getTimeStats(
    userId: string,
    query: TimeStatsQueryDto,
  ): Promise<TimeStatsResponse> {
    // 设置默认时间范围（最近30天）
    const endDate = query.endDate || new Date();
    const startDate =
      query.startDate ||
      new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 获取时间记录
    const timeRecords = await this.getTimeRecords(userId, {
      startDate,
      endDate,
    });

    // 获取番茄钟记录
    const pomodoroRecords = await this.getPomodoroRecords(userId, {
      startDate,
      endDate,
    });

    // 计算总工作时间和休息时间
    const totalWorkTime = timeRecords.reduce(
      (sum, record) => sum + (record.duration || 0),
      0,
    );

    // 统计番茄钟
    const totalPomodoros = pomodoroRecords.length;
    const completedPomodoros = pomodoroRecords.filter(
      (p) => p.status === PomodoroStatus.COMPLETED,
    ).length;
    const abandonedPomodoros = pomodoroRecords.filter(
      (p) => p.status === PomodoroStatus.ABANDONED,
    ).length;

    // 按日期分组统计
    const dateMap = new Map<string, any>();

    timeRecords.forEach((record) => {
      const date = record.startTime.toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          workTime: 0,
          breakTime: 0,
          pomodoros: 0,
        });
      }
      const dayData = dateMap.get(date);
      dayData.workTime += record.duration || 0;
    });

    pomodoroRecords.forEach((record) => {
      const date = record.startTime.toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          workTime: 0,
          breakTime: 0,
          pomodoros: 0,
        });
      }
      const dayData = dateMap.get(date);
      if (record.status === PomodoroStatus.COMPLETED) {
        dayData.pomodoros += 1;
      }
    });

    const records = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // 计算平均每天工作时间
    const daysCount = records.length || 1;
    const averageWorkTime = totalWorkTime / daysCount;

    return {
      totalWorkTime,
      totalBreakTime: 0, // 暂时为0，后续可以添加休息记录
      totalPomodoros,
      completedPomodoros,
      abandonedPomodoros,
      averageWorkTime,
      records,
    };
  }

  /**
   * 获取每日统计
   */
  async getDailyStats(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.getTimeStats(userId, {
      startDate: startOfDay,
      endDate: endOfDay,
    });
  }

  /**
   * 获取每周统计
   */
  async getWeeklyStats(userId: string, date: Date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return await this.getTimeStats(userId, {
      startDate: startOfWeek,
      endDate: endOfWeek,
    });
  }

  /**
   * 获取每月统计
   */
  async getMonthlyStats(userId: string, date: Date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    return await this.getTimeStats(userId, {
      startDate: startOfMonth,
      endDate: endOfMonth,
    });
  }
}

