import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activities.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('共治活动')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '活动列表（登录）' })
  findAll(@Query('status') status?: string) {
    return this.activitiesService.findAll(status);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: '公开活动列表' })
  findPublic(@Query('status') status?: string) {
    return this.activitiesService.findPublic(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '活动详情' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建活动' })
  create(@Body() createActivityDto: CreateActivityDto, @CurrentUser() user: any) {
    return this.activitiesService.create(createActivityDto, user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新活动' })
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除活动' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布活动' })
  publish(@Param('id') id: string) {
    return this.activitiesService.publish(id);
  }

  @Post(':id/participate')
  @Public()
  @ApiOperation({ summary: '参与活动' })
  participate(
    @Param('id') id: string,
    @Body() body: { userId?: string; participantName?: string; participantPhone?: string; content?: string },
  ) {
    return this.activitiesService.participate(id, body);
  }

  @Get(':id/participants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '参与者列表' })
  getParticipants(@Param('id') id: string) {
    return this.activitiesService.getParticipants(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '活动统计' })
  getStats(@Param('id') id: string) {
    return this.activitiesService.getStats(id);
  }
}
