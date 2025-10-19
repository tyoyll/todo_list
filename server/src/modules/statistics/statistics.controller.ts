import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StatsQueryDto } from './dto/stats-query.dto';

/**
 * 统计控制器
 */
@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 获取任务完成率统计
   */
  @Get('task-completion')
  async getTaskCompletionStats(
    @CurrentUser() user: any,
    @Query() query: StatsQueryDto,
  ) {
    return await this.statisticsService.getTaskCompletionStats(
      user.id,
      query,
    );
  }

  /**
   * 获取分类统计
   */
  @Get('categories')
  async getCategoryStats(
    @CurrentUser() user: any,
    @Query() query: StatsQueryDto,
  ) {
    return await this.statisticsService.getCategoryStats(user.id, query);
  }

  /**
   * 获取优先级统计
   */
  @Get('priorities')
  async getPriorityStats(
    @CurrentUser() user: any,
    @Query() query: StatsQueryDto,
  ) {
    return await this.statisticsService.getPriorityStats(user.id, query);
  }

  /**
   * 获取效率分析
   */
  @Get('efficiency')
  async getEfficiencyStats(
    @CurrentUser() user: any,
    @Query() query: StatsQueryDto,
  ) {
    return await this.statisticsService.getEfficiencyStats(user.id, query);
  }

  /**
   * 获取综合统计
   */
  @Get('overall')
  async getOverallStats(
    @CurrentUser() user: any,
    @Query() query: StatsQueryDto,
  ) {
    return await this.statisticsService.getOverallStats(user.id, query);
  }
}

