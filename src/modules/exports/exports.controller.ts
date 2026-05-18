import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ExportsService } from './exports.service';

@ApiTags('数据导出')
@ApiBearerAuth()
@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('entities')
  @ApiOperation({ summary: '导出经营主体 Excel' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'streetId', required: false })
  @ApiQuery({ name: 'riskLevel', required: false })
  async exportEntities(
    @Query() q: { type?: string; streetId?: string; riskLevel?: string },
    @Res() res: Response,
  ) {
    const buf = await this.exportsService.exportEntities(q);
    this.sendExcel(res, buf, '经营主体清单');
  }

  @Get('inspections')
  @ApiOperation({ summary: '导出检查记录 Excel' })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'inspectorId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async exportInspections(
    @Query() q: { entityId?: string; inspectorId?: string; startDate?: string; endDate?: string },
    @Res() res: Response,
  ) {
    const buf = await this.exportsService.exportInspections(q);
    this.sendExcel(res, buf, '检查记录清单');
  }

  @Get('complaints')
  @ApiOperation({ summary: '导出投诉记录 Excel' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async exportComplaints(
    @Query() q: { status?: string; startDate?: string; endDate?: string },
    @Res() res: Response,
  ) {
    const buf = await this.exportsService.exportComplaints(q);
    this.sendExcel(res, buf, '投诉记录清单');
  }

  @Get('rectifications')
  @ApiOperation({ summary: '导出整改记录 Excel' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  async exportRectifications(
    @Query() q: { status?: string; entityId?: string },
    @Res() res: Response,
  ) {
    const buf = await this.exportsService.exportRectifications(q);
    this.sendExcel(res, buf, '整改记录清单');
  }

  @Get('activities')
  @ApiOperation({ summary: '导出活动记录 Excel' })
  @ApiQuery({ name: 'status', required: false })
  async exportActivities(@Query() q: { status?: string }, @Res() res: Response) {
    const buf = await this.exportsService.exportActivities(q);
    this.sendExcel(res, buf, '活动记录清单');
  }

  @Get('licenses')
  @ApiOperation({ summary: '导出许可证备案 Excel' })
  @ApiQuery({ name: 'entityId', required: false })
  async exportLicenses(@Query() q: { entityId?: string }, @Res() res: Response) {
    const buf = await this.exportsService.exportLicenses(q);
    this.sendExcel(res, buf, '许可证备案清单');
  }

  private sendExcel(res: Response, buf: Buffer, label: string) {
    const filename = encodeURIComponent(`${label}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
      'Content-Length': buf.length,
    });
    res.end(buf);
  }
}
