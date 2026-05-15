const fs = require('fs');
const path = require('path');
const base = 'D:\\foodsatety\\foodsatety-backend\\src\\modules';

function writeFiles(modName, files) {
  const dir = path.join(base, modName);
  for (const [fname, content] of Object.entries(files)) {
    const fpath = path.join(dir, fname);
    fs.mkdirSync(path.dirname(fpath), { recursive: true });
    fs.writeFileSync(fpath, content);
  }
  console.log(`Created ${modName}`);
}

// Screenings
writeFiles('screenings', {
  'dto/screening.dto.ts': `import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel } from '@prisma/client';

export class CreateScreeningDto {
  @ApiProperty({ description: '计划ID' }) @IsString() @IsOptional() planId?: string;
  @ApiProperty({ description: '经营主体ID' }) @IsString() @IsNotEmpty() entityId: string;
  @IsOptional() infoVerified?: boolean;
  @IsEnum(RiskLevel) @IsOptional() riskLevel?: RiskLevel;
  @IsString() @IsOptional() issues?: string;
  @IsString() @IsOptional() photos?: string;
  @IsString() @IsOptional() notes?: string;
}`,
  'screenings.service.ts': `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateScreeningDto } from './dto/screening.dto';

@Injectable()
export class ScreeningsService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.screeningRecord.findMany({ skip: (page-1)*pageSize, take: pageSize, include: { entity: true, screener: { select: { id: true, realName: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.screeningRecord.count()
    ]);
    return { items, total, page, pageSize };
  }
  async findOne(id: string) { const r = await this.prisma.screeningRecord.findUnique({ where: { id }, include: { entity: true, plan: true } }); if (!r) throw new NotFoundException(); return r; }
  async create(dto: CreateScreeningDto, screenerId: string) {
    const record = await this.prisma.screeningRecord.create({ data: { ...dto, screenerId } });
    if (dto.riskLevel && dto.riskLevel !== 'UNRATED') {
      await this.prisma.bizEntity.update({ where: { id: dto.entityId }, data: { riskLevel: dto.riskLevel, riskRatedAt: new Date() } });
    }
    return record;
  }
  async getMyRecords(screenerId: string) { return this.prisma.screeningRecord.findMany({ where: { screenerId }, include: { entity: true }, orderBy: { createdAt: 'desc' } }); }
}`,
  'screenings.controller.ts': `import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScreeningsService } from './screenings.service';
import { CreateScreeningDto } from './dto/screening.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('风险排查')
@Controller('screenings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScreeningsController {
  constructor(private service: ScreeningsService) {}
  @Get() @ApiOperation({ summary: '排查记录列表' }) findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number) { return this.service.findAll(page, pageSize); }
  @Get('my') @Roles(UserRole.SCREENER) @ApiOperation({ summary: '我的排查记录' }) getMy(@CurrentUser('sub') userId: string) { return this.service.getMyRecords(userId); }
  @Get(':id') @ApiOperation({ summary: '排查详情' }) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(UserRole.SCREENER) @ApiOperation({ summary: '提交排查记录' }) create(@Body() dto: CreateScreeningDto, @CurrentUser('sub') userId: string) { return this.service.create(dto, userId); }
}`,
  'screenings.module.ts': `import { Module } from '@nestjs/common';
import { ScreeningsController } from './screenings.controller';
import { ScreeningsService } from './screenings.service';
@Module({ controllers: [ScreeningsController], providers: [ScreeningsService], exports: [ScreeningsService] })
export class ScreeningsModule {}`,
});

// Complaints
writeFiles('complaints', {
  'dto/complaint.dto.ts': `import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComplaintCategory, Satisfaction } from '@prisma/client';
export class CreateComplaintDto {
  @IsString() @IsOptional() entityId?: string;
  @ApiProperty({ description: '投诉类别' }) @IsEnum(ComplaintCategory) category: ComplaintCategory;
  @ApiProperty({ description: '投诉内容' }) @IsString() @IsNotEmpty() content: string;
  @IsString() @IsOptional() evidence?: string;
  @IsBoolean() @IsOptional() isAnonymous?: boolean;
  @IsString() @IsOptional() reporterName?: string;
  @IsString() @IsOptional() reporterPhone?: string;
}
export class HandleComplaintDto {
  @ApiProperty({ description: '处理结果' }) @IsString() @IsNotEmpty() result: string;
  @IsString() @IsOptional() photos?: string;
}
export class FeedbackComplaintDto {
  @ApiProperty({ description: '满意度' }) @IsEnum(Satisfaction) satisfaction: Satisfaction;
  @IsString() @IsOptional() remark?: string;
}`,
  'complaints.service.ts': `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateComplaintDto, HandleComplaintDto, FeedbackComplaintDto } from './dto/complaint.dto';
@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, pageSize = 20, status?: string) {
    const where: any = {}; if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({ where, skip: (page-1)*pageSize, take: pageSize, include: { entity: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.complaint.count({ where })
    ]);
    return { items, total, page, pageSize };
  }
  async findOne(id: string) { const r = await this.prisma.complaint.findUnique({ where: { id }, include: { entity: true, handles: true, feedbacks: true } }); if (!r) throw new NotFoundException(); return r; }
  async create(dto: CreateComplaintDto) { return this.prisma.complaint.create({ data: dto }); }
  async getConsumerComplaints(phone?: string) { const where: any = {}; if (phone) where.reporterPhone = phone; return this.prisma.complaint.findMany({ where, include: { entity: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }); }
  async firstHandle(id: string, dto: HandleComplaintDto, handlerId: string) {
    await this.findOne(id);
    await this.prisma.complaintHandle.create({ data: { complaintId: id, handlerId, handleType: 'FIRST', result: dto.result, photos: dto.photos } });
    return this.prisma.complaint.update({ where: { id }, data: { status: 'FIRST_FEEDBACK' } });
  }
  async feedback(id: string, dto: FeedbackComplaintDto) {
    await this.findOne(id);
    await this.prisma.complaintFeedback.create({ data: { complaintId: id, feedbackType: 'FIRST', satisfaction: dto.satisfaction, remark: dto.remark } });
    return this.prisma.complaint.update({ where: { id }, data: { status: dto.satisfaction === 'DISSATISFIED' ? 'SECOND_HANDLING' : 'RESOLVED' } });
  }
  async secondHandle(id: string, dto: HandleComplaintDto, handlerId: string) {
    await this.findOne(id);
    await this.prisma.complaintHandle.create({ data: { complaintId: id, handlerId, handleType: 'SECOND', result: dto.result, photos: dto.photos } });
    return this.prisma.complaint.update({ where: { id }, data: { status: 'SECOND_FEEDBACK' } });
  }
  async secondFeedback(id: string, dto: FeedbackComplaintDto) {
    await this.findOne(id);
    await this.prisma.complaintFeedback.create({ data: { complaintId: id, feedbackType: 'SECOND', satisfaction: dto.satisfaction, remark: dto.remark } });
    return this.prisma.complaint.update({ where: { id }, data: { status: 'CLOSED' } });
  }
}`,
  'complaints.controller.ts': `import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, HandleComplaintDto, FeedbackComplaintDto } from './dto/complaint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
@ApiTags('投诉举报')
@Controller('complaints')
export class ComplaintsController {
  constructor(private service: ComplaintsService) {}
  @UseGuards(JwtAuthGuard, RolesGuard) @Get() @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '投诉列表' }) findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number, @Query('status') status?: string) { return this.service.findAll(page, pageSize, status); }
  @UseGuards(JwtAuthGuard) @Get(':id') @ApiBearerAuth() @ApiOperation({ summary: '投诉详情' }) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Public() @Post() @ApiOperation({ summary: '发起投诉' }) create(@Body() dto: CreateComplaintDto) { return this.service.create(dto); }
  @Public() @Get('consumer/list') @ApiOperation({ summary: '消费者投诉列表' }) consumerList(@Query('phone') phone?: string) { return this.service.getConsumerComplaints(phone); }
  @UseGuards(JwtAuthGuard) @Post(':id/first-handle') @ApiBearerAuth() @Roles(UserRole.OPERATOR) @ApiOperation({ summary: '经营者首次处理' }) firstHandle(@Param('id') id: string, @Body() dto: HandleComplaintDto, @CurrentUser('sub') userId: string) { return this.service.firstHandle(id, dto, userId); }
  @Public() @Post(':id/feedback') @ApiOperation({ summary: '消费者反馈' }) feedback(@Param('id') id: string, @Body() dto: FeedbackComplaintDto) { return this.service.feedback(id, dto); }
  @UseGuards(JwtAuthGuard) @Post(':id/second-handle') @ApiBearerAuth() @Roles(UserRole.INSPECTOR, UserRole.ADMIN) @ApiOperation({ summary: '监管人员二次处理' }) secondHandle(@Param('id') id: string, @Body() dto: HandleComplaintDto, @CurrentUser('sub') userId: string) { return this.service.secondHandle(id, dto, userId); }
  @Public() @Post(':id/second-feedback') @ApiOperation({ summary: '消费者二次反馈' }) secondFeedback(@Param('id') id: string, @Body() dto: FeedbackComplaintDto) { return this.service.secondFeedback(id, dto); }
}`,
  'complaints.module.ts': `import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
@Module({ controllers: [ComplaintsController], providers: [ComplaintsService], exports: [ComplaintsService] })
export class ComplaintsModule {}`,
});

// Activities, Notifications, InfoCorrections, SelfInspections, Feedback - simplified
const simpleModules = {
  'activities': {
    dto: `import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
export class CreateActivityDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsEnum(ActivityType) type: ActivityType;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() config?: string;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsString() @IsOptional() targetAudience?: string;
}`,
    service: `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, pageSize = 20) { const [items,total] = await Promise.all([this.prisma.activity.findMany({skip:(page-1)*pageSize,take:pageSize,orderBy:{createdAt:'desc'}}),this.prisma.activity.count()]); return {items,total,page,pageSize}; }
  async findPublic() { return this.prisma.activity.findMany({where:{status:{in:['PUBLISHED','ACTIVE']}},orderBy:{createdAt:'desc'}}); }
  async findOne(id: string) { const r = await this.prisma.activity.findUnique({where:{id},include:{participants:true}}); if(!r) throw new NotFoundException(); return r; }
  create(dto: any, userId: string) { return this.prisma.activity.create({data:{...dto,createdBy:userId}}); }
  update(id: string, dto: any) { return this.prisma.activity.update({where:{id},data:dto}); }
  remove(id: string) { return this.prisma.activity.delete({where:{id}}); }
  publish(id: string) { return this.prisma.activity.update({where:{id},data:{status:'PUBLISHED'}}); }
  async participate(id: string, userId?: string, data?: any) { return this.prisma.activityParticipant.create({data:{activityId:id,userId,...data}}); }
  async getParticipants(id: string) { return this.prisma.activityParticipant.findMany({where:{activityId:id}}); }
  async getStats(id: string) { return {participantCount:await this.prisma.activityParticipant.count({where:{activityId:id}})}; }
}`,
    controller: `import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
@ApiTags('共治活动')
@Controller('activities')
export class ActivitiesController {
  constructor(private service: ActivitiesService) {}
  @UseGuards(JwtAuthGuard) @Get() @ApiBearerAuth() @ApiOperation({summary:'活动列表'}) findAll() { return this.service.findAll(); }
  @Public() @Get('public') @ApiOperation({summary:'公开活动列表'}) findPublic() { return this.service.findPublic(); }
  @UseGuards(JwtAuthGuard) @Get(':id') @ApiBearerAuth() @ApiOperation({summary:'活动详情'}) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Post() @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'创建活动'}) create(@Body() dto: CreateActivityDto,@CurrentUser('sub') userId: string) { return this.service.create(dto,userId); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Put(':id') @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'更新活动'}) update(@Param('id') id: string,@Body() dto: any) { return this.service.update(id,dto); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Delete(':id') @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'删除活动'}) remove(@Param('id') id: string) { return this.service.remove(id); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Post(':id/publish') @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'发布活动'}) publish(@Param('id') id: string) { return this.service.publish(id); }
  @Public() @Post(':id/participate') @ApiOperation({summary:'参与活动'}) participate(@Param('id') id: string,@Body() body?: any) { return this.service.participate(id,undefined,body); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Get(':id/participants') @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'参与者列表'}) getParticipants(@Param('id') id: string) { return this.service.getParticipants(id); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Get(':id/stats') @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'活动统计'}) getStats(@Param('id') id: string) { return this.service.getStats(id); }
}`,
    module: `import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
@Module({ controllers: [ActivitiesController], providers: [ActivitiesService], exports: [ActivitiesService] })
export class ActivitiesModule {}`,
  },
  'notifications': {
    dto: `import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
export class CreateNotificationDto {
  @ApiProperty() @IsString() @IsNotEmpty() userId: string;
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() content?: string;
  @ApiProperty() @IsEnum(NotificationType) type: NotificationType;
  @IsString() @IsOptional() relatedId?: string;
  @IsString() @IsOptional() relatedType?: string;
}`,
    service: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async findAll(userId: string, page = 1, pageSize = 20) { const [items,total] = await Promise.all([this.prisma.notification.findMany({where:{userId},skip:(page-1)*pageSize,take:pageSize,orderBy:{createdAt:'desc'}}),this.prisma.notification.count({where:{userId}})]); return {items,total,page,pageSize}; }
  async getUnreadCount(userId: string) { return this.prisma.notification.count({where:{userId,isRead:false}}); }
  async markRead(id: string) { return this.prisma.notification.update({where:{id},data:{isRead:true}}); }
  async markAllRead(userId: string) { return this.prisma.notification.updateMany({where:{userId,isRead:false},data:{isRead:true}}); }
  async create(data: any) { return this.prisma.notification.create({data}); }
}`,
    controller: `import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@ApiTags('消息通知')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private service: NotificationsService) {}
  @Get() @ApiOperation({summary:'我的通知列表'}) findAll(@CurrentUser('sub') userId: string,@Query('page') page?: number,@Query('pageSize') pageSize?: number) { return this.service.findAll(userId,page,pageSize); }
  @Get('unread-count') @ApiOperation({summary:'未读数量'}) getUnreadCount(@CurrentUser('sub') userId: string) { return this.service.getUnreadCount(userId); }
  @Put(':id/read') @ApiOperation({summary:'标记已读'}) markRead(@Param('id') id: string) { return this.service.markRead(id); }
  @Put('read-all') @ApiOperation({summary:'全部已读'}) markAllRead(@CurrentUser('sub') userId: string) { return this.service.markAllRead(userId); }
}`,
    module: `import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
@Module({ controllers: [NotificationsController], providers: [NotificationsService], exports: [NotificationsService] })
export class NotificationsModule {}`,
  },
  'info-corrections': {
    dto: `import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateInfoCorrectionDto {
  @ApiProperty() @IsString() @IsNotEmpty() entityId: string;
  @ApiProperty() @IsString() @IsNotEmpty() field: string;
  @IsString() @IsOptional() oldValue?: string;
  @ApiProperty() @IsString() @IsNotEmpty() newValue: string;
  @IsString() @IsOptional() evidence?: string;
  @IsString() @IsOptional() reason?: string;
}
export class ReviewInfoCorrectionDto {
  @ApiProperty() @IsString() @IsNotEmpty() status: string;
  @IsString() @IsOptional() reviewRemark?: string;
}`,
    service: `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class InfoCorrectionsService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, pageSize = 20, status?: string) { const where: any = {}; if(status) where.status = status; const [items,total] = await Promise.all([this.prisma.infoCorrection.findMany({where,skip:(page-1)*pageSize,take:pageSize,include:{entity:{select:{name:true}},submitter:{select:{realName:true}}},orderBy:{createdAt:'desc'}}),this.prisma.infoCorrection.count({where})]); return {items,total,page,pageSize}; }
  async findOne(id: string) { const r = await this.prisma.infoCorrection.findUnique({where:{id}}); if(!r) throw new NotFoundException(); return r; }
  async create(dto: any, submittedBy: string) { return this.prisma.infoCorrection.create({data:{...dto,submittedBy}}); }
  async review(id: string, dto: any, reviewerId: string) { const c = await this.prisma.infoCorrection.update({where:{id},data:{status:dto.status,reviewRemark:dto.reviewRemark,reviewerId,reviewedAt:new Date()}}); if(dto.status==='APPROVED'){await this.prisma.bizEntity.update({where:{id:c.entityId},data:{[c.field]:c.newValue}});} return c; }
}`,
    controller: `import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InfoCorrectionsService } from './info-corrections.service';
import { CreateInfoCorrectionDto, ReviewInfoCorrectionDto } from './dto/info-correction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
@ApiTags('信息更正')
@Controller('info-corrections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InfoCorrectionsController {
  constructor(private service: InfoCorrectionsService) {}
  @Get() @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'更正申请列表'}) findAll(@Query('page') page?: number,@Query('pageSize') pageSize?: number,@Query('status') status?: string) { return this.service.findAll(page,pageSize,status); }
  @Get(':id') @ApiOperation({summary:'更正详情'}) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(UserRole.OPERATOR) @ApiOperation({summary:'提交更正申请'}) create(@Body() dto: CreateInfoCorrectionDto,@CurrentUser('sub') userId: string) { return this.service.create(dto,userId); }
  @Put(':id/review') @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'审批更正'}) review(@Param('id') id: string,@Body() dto: ReviewInfoCorrectionDto,@CurrentUser('sub') userId: string) { return this.service.review(id,dto,userId); }
}`,
    module: `import { Module } from '@nestjs/common';
import { InfoCorrectionsController } from './info-corrections.controller';
import { InfoCorrectionsService } from './info-corrections.service';
@Module({ controllers: [InfoCorrectionsController], providers: [InfoCorrectionsService], exports: [InfoCorrectionsService] })
export class InfoCorrectionsModule {}`,
  },
  'self-inspections': {
    dto: `import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SelfInspectionType } from '@prisma/client';
export class CreateSelfInspectionDto {
  @ApiProperty() @IsString() @IsNotEmpty() entityId: string;
  @ApiProperty() @IsEnum(SelfInspectionType) type: SelfInspectionType;
  @IsString() @IsOptional() items?: string;
  @IsString() @IsOptional() issues?: string;
  @IsString() @IsOptional() result?: string;
  @IsString() @IsOptional() photos?: string;
}`,
    service: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class SelfInspectionsService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, pageSize = 20) { const [items,total] = await Promise.all([this.prisma.selfInspection.findMany({skip:(page-1)*pageSize,take:pageSize,include:{entity:{select:{name:true}},operator:{select:{realName:true}}},orderBy:{createdAt:'desc'}}),this.prisma.selfInspection.count()]); return {items,total,page,pageSize}; }
  async getMyRecords(operatorId: string) { return this.prisma.selfInspection.findMany({where:{operatorId},include:{entity:{select:{name:true}}},orderBy:{createdAt:'desc'}}); }
  async findOne(id: string) { return this.prisma.selfInspection.findUnique({where:{id},include:{entity:true}}); }
  async create(dto: any, operatorId: string) { return this.prisma.selfInspection.create({data:{...dto,operatorId}}); }
}`,
    controller: `import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SelfInspectionsService } from './self-inspections.service';
import { CreateSelfInspectionDto } from './dto/self-inspection.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
@ApiTags('自查自纠')
@Controller('self-inspections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SelfInspectionsController {
  constructor(private service: SelfInspectionsService) {}
  @Get() @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'自查列表'}) findAll(@Query('page') page?: number,@Query('pageSize') pageSize?: number) { return this.service.findAll(page,pageSize); }
  @Get('my') @Roles(UserRole.OPERATOR) @ApiOperation({summary:'我的自查记录'}) getMy(@CurrentUser('sub') userId: string) { return this.service.getMyRecords(userId); }
  @Get(':id') @ApiOperation({summary:'自查详情'}) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(UserRole.OPERATOR) @ApiOperation({summary:'提交自查记录'}) create(@Body() dto: CreateSelfInspectionDto,@CurrentUser('sub') userId: string) { return this.service.create(dto,userId); }
}`,
    module: `import { Module } from '@nestjs/common';
import { SelfInspectionsController } from './self-inspections.controller';
import { SelfInspectionsService } from './self-inspections.service';
@Module({ controllers: [SelfInspectionsController], providers: [SelfInspectionsService], exports: [SelfInspectionsService] })
export class SelfInspectionsModule {}`,
  },
  'feedback': {
    dto: `import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FeedbackCategory } from '@prisma/client';
export class CreateFeedbackDto {
  @ApiProperty() @IsEnum(FeedbackCategory) category: FeedbackCategory;
  @ApiProperty() @IsString() @IsNotEmpty() content: string;
  @IsString() @IsOptional() contact?: string;
}
export class ReplyFeedbackDto {
  @ApiProperty() @IsString() @IsNotEmpty() reply: string;
}`,
    service: `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, pageSize = 20) { const [items,total] = await Promise.all([this.prisma.feedback.findMany({skip:(page-1)*pageSize,take:pageSize,orderBy:{createdAt:'desc'}}),this.prisma.feedback.count()]); return {items,total,page,pageSize}; }
  async findOne(id: string) { const r = await this.prisma.feedback.findUnique({where:{id}}); if(!r) throw new NotFoundException(); return r; }
  create(dto: any, userId?: string) { return this.prisma.feedback.create({data:{...dto,userId}}); }
  async reply(id: string, dto: any, repliedBy: string) { return this.prisma.feedback.update({where:{id},data:{reply:dto.reply,repliedBy,repliedAt:new Date(),status:'REPLIED'}}); }
}`,
    controller: `import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, ReplyFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
@ApiTags('意见反馈')
@Controller('feedback')
export class FeedbackController {
  constructor(private service: FeedbackService) {}
  @UseGuards(JwtAuthGuard,RolesGuard) @Get() @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'反馈列表'}) findAll(@Query('page') page?: number,@Query('pageSize') pageSize?: number) { return this.service.findAll(page,pageSize); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Get(':id') @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'反馈详情'}) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Public() @Post() @ApiOperation({summary:'提交反馈'}) create(@Body() dto: CreateFeedbackDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard,RolesGuard) @Put(':id/reply') @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN,UserRole.ADMIN) @ApiOperation({summary:'回复反馈'}) reply(@Param('id') id: string,@Body() dto: ReplyFeedbackDto,@CurrentUser('sub') userId: string) { return this.service.reply(id,dto,userId); }
}`,
    module: `import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
@Module({ controllers: [FeedbackController], providers: [FeedbackService], exports: [FeedbackService] })
export class FeedbackModule {}`,
  },
};

for (const [name, files] of Object.entries(simpleModules)) {
  writeFiles(name, files);
}

console.log('All modules created!');
