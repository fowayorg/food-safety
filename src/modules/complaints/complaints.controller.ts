import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaints.dto';
import { BatchDeleteDto } from '../../common/dto/batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ComplaintStatus, ComplaintCategory, UserRole } from '@prisma/client';

@ApiTags('投诉举报')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '发起投诉（公开）' })
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER, UserRole.OPERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '投诉列表（管理）' })
  findAll(
    @Query('status') status?: ComplaintStatus,
    @Query('category') category?: ComplaintCategory,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.complaintsService.findAll({ status, category }, { page: Number(page) || 1, pageSize: Number(pageSize) || 20 });
  }

  @Get('consumer/list')
  @Public()
  @ApiOperation({ summary: '消费者投诉列表（公开）' })
  findConsumerList(
    @Query('reporterPhone') reporterPhone?: string,
    @Query('status') status?: ComplaintStatus,
  ) {
    return this.complaintsService.findConsumerList({ reporterPhone, status });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '投诉详情' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新投诉' })
  update(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    return this.complaintsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除投诉' })
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(id);
  }

  @Post('batch-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量删除投诉' })
  batchRemove(@Body() dto: BatchDeleteDto) { return this.complaintsService.batchRemove(dto.ids); }

  @Post(':id/first-handle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '经营者首次处理' })
  firstHandle(
    @Param('id') id: string,
    @Body() body: { result: string; photos?: string },
    @CurrentUser() user: any,
  ) {
    return this.complaintsService.firstHandle(id, user.sub, body.result, body.photos);
  }

  @Post(':id/feedback')
  @Public()
  @ApiOperation({ summary: '消费者反馈' })
  addFeedback(
    @Param('id') id: string,
    @Body() body: { satisfaction: string; remark?: string },
  ) {
    return this.complaintsService.addConsumerFeedback(id, body.satisfaction, body.remark);
  }

  @Post(':id/second-handle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSPECTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '监管人员二次处理' })
  secondHandle(
    @Param('id') id: string,
    @Body() body: { result: string; photos?: string },
    @CurrentUser() user: any,
  ) {
    return this.complaintsService.secondHandle(id, user.sub, body.result, body.photos);
  }

  @Post(':id/second-feedback')
  @Public()
  @ApiOperation({ summary: '消费者二次反馈' })
  addSecondFeedback(
    @Param('id') id: string,
    @Body() body: { satisfaction: string; remark?: string },
  ) {
    return this.complaintsService.addSecondFeedback(id, body.satisfaction, body.remark);
  }
}
