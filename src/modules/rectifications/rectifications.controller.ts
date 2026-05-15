import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RectificationsService } from './rectifications.service';
import { CreateRectificationDto, SubmitRectificationDto, ReviewRectificationDto } from './dto/rectifications.dto';
import { BatchDeleteDto, BatchReviewDto } from '../../common/dto/batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('整改管理')
@Controller('rectifications')
export class RectificationsController {
  constructor(private readonly rectificationsService: RectificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建整改任务' })
  create(@Body() dto: CreateRectificationDto) {
    return this.rectificationsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '整改列表（管理端）' })
  findAll(
    @Query('entityId') entityId?: string,
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.rectificationsService.findAll(
      { entityId, status, level },
      { page: Number(page) || 1, pageSize: Number(pageSize) || 20 },
    );
  }

  @Get('entity/:entityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '按主体查询整改' })
  findByEntity(@Param('entityId') entityId: string) {
    return this.rectificationsService.findByEntity(entityId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '整改详情' })
  findOne(@Param('id') id: string) {
    return this.rectificationsService.findOne(id);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '经营者提交整改' })
  submit(@Param('id') id: string, @Body() dto: SubmitRectificationDto) {
    return this.rectificationsService.submit(id, dto);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSPECTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '监管人员审核整改' })
  review(
    @Param('id') id: string,
    @Body() dto: ReviewRectificationDto,
    @CurrentUser() user: any,
  ) {
    return this.rectificationsService.review(id, user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除整改记录' })
  remove(@Param('id') id: string) {
    return this.rectificationsService.remove(id);
  }

  @Post('batch-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量删除整改记录' })
  batchRemove(@Body() dto: BatchDeleteDto) { return this.rectificationsService.batchRemove(dto.ids); }

  @Post('batch-review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSPECTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量审核整改' })
  batchReview(@Body() dto: BatchReviewDto, @CurrentUser() user: any) {
    return this.rectificationsService.batchReview(dto.ids, user.sub, dto.result, dto.remark);
  }
}
