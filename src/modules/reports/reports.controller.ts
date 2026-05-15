import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetStatsDto } from './get-stats.dto';

@ApiTags('统计报表')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inspections')
  @ApiOperation({ summary: '检查记录统计' })
  async getInspectionStats(@Query() dto: GetStatsDto) {
    return this.reportsService.getInspectionStats(dto);
  }

  @Get('complaints')
  @ApiOperation({ summary: '投诉举报统计' })
  async getComplaintStats(@Query() dto: GetStatsDto) {
    return this.reportsService.getComplaintStats(dto);
  }

  @Get('entities')
  @ApiOperation({ summary: '经营主体统计' })
  async getEntityStats(@Query() dto: GetStatsDto) {
    return this.reportsService.getEntityStats(dto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: '仪表盘综合数据' })
  async getDashboard() {
    return this.reportsService.getDashboardStats();
  }
}
