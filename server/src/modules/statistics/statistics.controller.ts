import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StatsQueryDto } from './dto/stats-query.dto';
import { ExportReportDto } from './dto/export-report.dto';

/**
 * 统计控制器
 */
@ApiTags('统计')
@ApiBearerAuth('JWT-auth')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 获取任务完成率统计
   */
  @Get('task-completion')
  @ApiOperation({
    summary: '获取任务完成率统计',
    description: '获取指定时间范围内的任务完成情况统计',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取任务统计',
  })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiOperation({
    summary: '获取分类统计',
    description: '按任务分类统计完成情况',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取分类统计',
  })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiOperation({
    summary: '获取优先级统计',
    description: '按任务优先级统计完成情况',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取优先级统计',
  })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiOperation({
    summary: '获取效率分析',
    description: '分析任务完成效率和工作习惯',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取效率分析',
  })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiOperation({
    summary: '获取综合统计',
    description: '获取包含任务和效率的综合统计信息',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取综合统计',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getOverallStats(
    @CurrentUser() user: any,
    @Query() query: StatsQueryDto,
  ) {
    return await this.statisticsService.getOverallStats(user.id, query);
  }

  /**
   * 导出Excel报表
   */
  @Get('export/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOperation({
    summary: '导出Excel报表',
    description: '导出任务统计和效率分析的Excel报表',
  })
  @ApiResponse({
    status: 200,
    description: '成功导出Excel文件',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async exportToExcel(
    @CurrentUser() user: any,
    @Query() exportDto: ExportReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.statisticsService.exportToExcel(user.id, exportDto);
    
    const filename = `task-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    res.send(buffer);
  }

  /**
   * 导出PDF报表
   */
  @Get('export/pdf')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({
    summary: '导出PDF报表',
    description: '导出任务统计和效率分析的PDF报表',
  })
  @ApiResponse({
    status: 200,
    description: '成功导出PDF文件',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async exportToPDF(
    @CurrentUser() user: any,
    @Query() exportDto: ExportReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.statisticsService.exportToPDF(user.id, exportDto);
    
    const filename = `task-report-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    res.send(buffer);
  }
}

