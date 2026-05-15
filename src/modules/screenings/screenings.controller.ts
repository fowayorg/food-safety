import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScreeningsService } from './screenings.service';
import { CreateScreeningRecordDto, UpdateScreeningRecordDto } from './dto/screenings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('风险排查记录')
@Controller('screenings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScreeningsController {
  constructor(private readonly screeningsService: ScreeningsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SCREENER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '提交排查记录' })
  create(@Body() dto: CreateScreeningRecordDto, @CurrentUser() user: any) {
    return this.screeningsService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: '排查记录列表' })
  findAll(
    @Query('entityId') entityId?: string,
    @Query('screenerId') screenerId?: string,
    @Query('planId') planId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.screeningsService.findAll(
      { entityId, screenerId, planId },
      { page: Number(page) || 1, pageSize: Number(pageSize) || 20 },
    );
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SCREENER)
  @ApiOperation({ summary: '我的排查记录' })
  findMy(@CurrentUser() user: any) {
    return this.screeningsService.findAll({ screenerId: user.userId });
  }

  @Get(':id')
  @ApiOperation({ summary: '排查详情' })
  findOne(@Param('id') id: string) {
    return this.screeningsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SCREENER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新排查记录' })
  update(@Param('id') id: string, @Body() dto: UpdateScreeningRecordDto) {
    return this.screeningsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除排查记录' })
  remove(@Param('id') id: string) {
    return this.screeningsService.remove(id);
  }
}
