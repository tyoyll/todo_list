import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MarkReadDto, MarkAllReadDto } from './dto/notification.dto';

/**
 * 通知控制器
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * 获取用户通知列表
   */
  @Get()
  async getUserNotifications(
    @CurrentUser() user: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.notificationsService.getUserNotifications(user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /**
   * 获取未读通知数量
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * 标记通知为已读
   */
  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id') notificationId: string,
  ) {
    return await this.notificationsService.markAsRead(
      user.id,
      notificationId,
    );
  }

  /**
   * 标记所有通知为已读
   */
  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    return await this.notificationsService.markAllAsRead(user.id);
  }

  /**
   * 删除通知
   */
  @Delete(':id')
  async deleteNotification(
    @CurrentUser() user: any,
    @Param('id') notificationId: string,
  ) {
    return await this.notificationsService.deleteNotification(
      user.id,
      notificationId,
    );
  }

  /**
   * 清除所有已读通知
   */
  @Delete('read/clear')
  async clearReadNotifications(@CurrentUser() user: any) {
    return await this.notificationsService.clearReadNotifications(user.id);
  }

  /**
   * 触发休息提醒检查（手动）
   */
  @Post('rest-reminder/check')
  async checkRestReminder(@CurrentUser() user: any) {
    await this.notificationsService.checkRestReminder(user.id);
    return { message: '休息提醒检查已触发' };
  }
}

