import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notifications.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { NotificationTemplateService } from '../../common/services/notification-template.service';
import { BatchDeleteDto } from '../../common/dto/batch.dto';

@ApiTags('消息通知')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly templateService: NotificationTemplateService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '创建通知' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '我的通知列表' })
  findAll(
    @Query('isRead') isRead?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @CurrentUser() user?: any,
  ) {
    return this.notificationsService.findAll(
      { userId: user?.userId, isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined, type },
      { page: Number(page) || 1, pageSize: Number(pageSize) || 20 },
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: '未读数量' })
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: '通知统计' })
  getStats() {
    return Promise.all([
      this.notificationsService.getByTypeStats(),
      this.notificationsService.getReadStats(),
    ]).then(([typeStats, readStats]) => ({ typeStats, ...readStats }));
  }

  @Get('templates')
  @ApiOperation({ summary: '获取通知模板列表' })
  getTemplates() {
    return this.templateService.getAvailableTemplates();
  }

  @Get(':id')
  @ApiOperation({ summary: '通知详情' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记已读' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Put('batch-read')
  @ApiOperation({ summary: '批量标记已读' })
  batchMarkRead(@Body() dto: BatchDeleteDto) {
    return this.notificationsService.batchMarkRead(dto.ids);
  }

  @Post('batch-delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '批量删除通知' })
  batchRemove(@Body() dto: BatchDeleteDto) {
    return this.notificationsService.batchRemove(dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
