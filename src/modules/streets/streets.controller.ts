import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StreetsService } from './streets.service';
import { CreateStreetDto, UpdateStreetDto } from './dto/street.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('街道管理')
@Controller('streets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StreetsController {
  constructor(private service: StreetsService) {}
  @Get() @ApiOperation({ summary: '街道列表' }) findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOperation({ summary: '街道详情' }) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '创建街道' }) create(@Body() dto: CreateStreetDto) { return this.service.create(dto); }
  @Put(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '更新街道' }) update(@Param('id') id: string, @Body() dto: UpdateStreetDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(UserRole.SUPER_ADMIN) @ApiOperation({ summary: '删除街道' }) remove(@Param('id') id: string) { return this.service.remove(id); }
}
