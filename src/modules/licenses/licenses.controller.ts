import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto, UpdateLicenseDto } from './licenses.dto';

@ApiTags('licenses')
@ApiBearerAuth()
@Controller('licenses')
export class LicensesController {
  constructor(private readonly service: LicensesService) {}

  @Get()
  @ApiOperation({ summary: '许可备案列表' })
  findAll(@Query() query: { page?: string; pageSize?: string; entityId?: string }) {
    return this.service.findAll({
      page: parseInt(query.page as string || '1', 10),
      pageSize: parseInt(query.pageSize as string || '10', 10),
      entityId: query.entityId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '许可备案详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建许可备案' })
  create(@Body() dto: CreateLicenseDto) {
    return this.service.create(dto as any);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新许可备案' })
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.service.update(id, dto as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除许可备案' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}