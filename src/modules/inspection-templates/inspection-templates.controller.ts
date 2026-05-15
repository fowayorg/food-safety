import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InspectionTemplatesService } from './inspection-templates.service';
import { CreateInspectionTemplateDto, UpdateInspectionTemplateDto } from './dto/inspection-templates.dto';

@ApiTags('inspection-templates')
@Controller('inspection-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InspectionTemplatesController {
  constructor(private readonly service: InspectionTemplatesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '创建检查模板' })
  create(@Body() dto: CreateInspectionTemplateDto, @Req() req) {
    return this.service.create(dto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '获取所有检查模板' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER)
  @ApiOperation({ summary: '获取检查模板详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '更新检查模板' })
  update(@Param('id') id: string, @Body() dto: UpdateInspectionTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除检查模板' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
