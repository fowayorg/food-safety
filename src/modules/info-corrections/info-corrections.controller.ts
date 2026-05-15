import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { InfoCorrectionsService } from './info-corrections.service';
import { CreateInfoCorrectionDto, ReviewInfoCorrectionDto, InfoCorrectionQueryDto } from './dto/info-corrections.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('info-corrections')
export class InfoCorrectionsController {
  constructor(private readonly infoCorrectionsService: InfoCorrectionsService) {}

  /**
   * 公开接口：消费者提交信息纠错（无需登录）
   */
  @Public()
  @Post()
  create(@Body() createDto: CreateInfoCorrectionDto) {
    return this.infoCorrectionsService.create(createDto);
  }

  /**
   * 公开接口：消费者查询自己的纠错记录
   */
  @Public()
  @Get('my')
  findMyCorrections(@Query('phone') phone: string) {
    if (!phone) {
      return { message: '请提供手机号' };
    }
    return this.infoCorrectionsService.findByPhone(phone);
  }

  /**
   * 管理端：分页查询纠错列表
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  findAll(@Query() query: InfoCorrectionQueryDto) {
    return this.infoCorrectionsService.findAll(query);
  }

  /**
   * 管理端：获取纠错统计
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  getStats() {
    return this.infoCorrectionsService.getStats();
  }

  /**
   * 管理端：查看纠错详情
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  findOne(@Param('id') id: string) {
    return this.infoCorrectionsService.findOne(id);
  }

  /**
   * 经营者/监管员：更新自己的纠错申请
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles(UserRole.OPERATOR, UserRole.INSPECTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.infoCorrectionsService.update(id, updateDto);
  }

  /**
   * 管理员：删除纠错申请
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.infoCorrectionsService.remove(id);
  }

  /**
   * 监管员/管理员：审核纠错申请
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/review')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSPECTOR)
  review(
    @Param('id') id: string, 
    @Body() reviewDto: ReviewInfoCorrectionDto,
    @CurrentUser() user: any
  ) {
    return this.infoCorrectionsService.review(id, reviewDto, user.userId);
  }
}
