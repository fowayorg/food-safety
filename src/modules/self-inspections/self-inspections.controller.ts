import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SelfInspectionsService } from './self-inspections.service';
import { CreateSelfInspectionDto, UpdateSelfInspectionDto } from './dto/self-inspections.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SelfInspectionType, UserRole } from '@prisma/client';

@ApiTags('自查自纠')
@Controller('self-inspections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SelfInspectionsController {
  constructor(private readonly selfInspectionsService: SelfInspectionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '提交自查记录' })
  create(@Body() dto: CreateSelfInspectionDto, @CurrentUser() user: any) {
    return this.selfInspectionsService.create(dto, user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR, UserRole.SCREENER, UserRole.OPERATOR)
  @ApiOperation({ summary: '自查列表（管理）' })
  findAll(
    @Query('type') type?: SelfInspectionType,
    @Query('entityId') entityId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.selfInspectionsService.findAll(
      { type, entityId },
      { page: Number(page) || 1, pageSize: Number(pageSize) || 20 },
    );
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: '我的自查记录' })
  findMy(@CurrentUser() user: any) {
    return this.selfInspectionsService.findMy(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: '自查详情' })
  findOne(@Param('id') id: string) {
    return this.selfInspectionsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '更新自查记录' })
  update(@Param('id') id: string, @Body() dto: UpdateSelfInspectionDto) {
    return this.selfInspectionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除自查记录' })
  remove(@Param('id') id: string) {
    return this.selfInspectionsService.remove(id);
  }

  @Put(':id/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: '提交自查' })
  submit(@Param('id') id: string) {
    return this.selfInspectionsService.submit(id);
  }
}
