import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { FeedbackCategory, UserRole } from '@prisma/client';

@ApiTags('意见反馈')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '提交反馈（公开）' })
  create(@Body() dto: CreateFeedbackDto, @CurrentUser() user?: any) {
    return this.feedbackService.create({ ...dto, userId: user?.userId });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER, UserRole.OPERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '反馈列表（管理）' })
  findAll(
    @Query('category') category?: FeedbackCategory,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.feedbackService.findAll(
      { category, status },
      { page: Number(page) || 1, pageSize: Number(pageSize) || 20 },
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '反馈详情' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新反馈' })
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除反馈' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }

  @Put(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSPECTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '回复反馈' })
  reply(
    @Param('id') id: string,
    @Body() body: { reply: string },
    @CurrentUser() user: any,
  ) {
    return this.feedbackService.reply(id, user.userId, body.reply);
  }
}
