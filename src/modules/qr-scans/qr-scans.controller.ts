import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { QrScansService } from './qr-scans.service';
import { CreateQrScanDto, QueryQrScansDto } from './dto/qr-scans.dto';

@ApiTags('qr-scans')
@Controller('qr-scans')
export class QrScansController {
  constructor(private readonly service: QrScansService) {}

  /**
   * 公开接口：扫码核销（无需登录）
   * 移动端/消费者扫码时调用
   */
  @Post('scan')
  @ApiOperation({ summary: '扫码核销（公开接口）' })
  scan(@Body() dto: CreateQrScanDto) {
    return this.service.scan(dto);
  }

  // --- 以下为管理端接口（需鉴权） ---

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '查询扫码记录列表' })
  findAll(@Query() query: QueryQrScansDto) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '扫码统计概览' })
  getStats(
    @Query('qrcodeId') qrcodeId?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.service.getStats(qrcodeId, entityId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '获取扫码记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
