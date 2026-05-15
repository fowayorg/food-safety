import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto, UpdateInspectionDto } from './dto/inspections.dto';
import { BatchDeleteDto } from '../../common/dto/batch.dto';

@ApiTags('inspections')
@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InspectionsController {
  constructor(private readonly service: InspectionsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '提交检查记录' })
  create(@Body() dto: CreateInspectionDto, @Req() req) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '获取所有检查记录' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '获取检查记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  @ApiOperation({ summary: '更新检查记录' })
  update(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除检查记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('batch-delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '批量删除检查记录' })
  batchRemove(@Body() dto: BatchDeleteDto) {
    return this.service.batchRemove(dto.ids);
  }
}
