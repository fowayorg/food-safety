import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScreeningPlansService } from './screening-plans.service';
import { CreateScreeningPlanDto } from './dto/screening-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('排查计划')
@Controller('screening-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScreeningPlansController {
  constructor(private service: ScreeningPlansService) {}
  @Get() @ApiOperation({ summary: '计划列表' }) findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOperation({ summary: '计划详情' }) findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '创建计划' }) create(@Body() dto: CreateScreeningPlanDto, @CurrentUser('sub') userId: string) { return this.service.create(dto, userId); }
  @Put(':id') @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '更新计划' }) update(@Param('id') id: string, @Body() dto: Partial<CreateScreeningPlanDto>) { return this.service.update(id, dto); }
  @Delete(':id') @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '删除计划' }) remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/publish') @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '发布计划' }) publish(@Param('id') id: string) { return this.service.publish(id); }
  @Post(':id/cancel') @UseGuards(RolesGuard) @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) @ApiOperation({ summary: '取消计划' }) cancel(@Param('id') id: string) { return this.service.cancel(id); }
}
