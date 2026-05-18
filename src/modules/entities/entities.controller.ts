import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EntitiesService } from './entities.service';
import { CreateEntityDto, UpdateEntityDto, CreateLicenseDto, UpdateLicenseDto, CreatePhotoDto } from './dto/entity.dto';
import { BatchDeleteDto } from '../../common/dto/batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('经营主体')
@Controller('entities')
export class EntitiesController {
  constructor(private service: EntitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '主体列表' })
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('type') type?: string, @Query('streetId') streetId?: string, @Query('riskLevel') riskLevel?: string, @Query('status') status?: string, @Query('search') search?: string) {
    return this.service.findAll(
      parseInt(page as string || '1', 10),
      parseInt(pageSize as string || '10', 10),
      { type, streetId, riskLevel, status, search },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '主体统计' })
  getStats() { return this.service.getStats(); }

  @Public()
  @Get('search')
  @ApiOperation({ summary: '扫码搜索' })
  search(@Query('code') code: string) { return this.service.searchByCode(code); }

  @Public()
  @Get(':id/public')
  @ApiOperation({ summary: '扫码查看公开信息' })
  getPublicInfo(@Param('id') id: string) { return this.service.getPublicInfo(id); }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '主体详情' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '创建主体' })
  create(@Body() dto: CreateEntityDto, @CurrentUser('sub') userId: string) { return this.service.create(dto, userId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '更新主体' })
  update(@Param('id') id: string, @Body() dto: UpdateEntityDto) { return this.service.update(id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除主体' })
  remove(@Param('id') id: string) { return this.service.remove(id); }

  // 批量删除
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('batch-delete')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '批量删除主体' })
  batchRemove(@Body() dto: BatchDeleteDto) { return this.service.batchRemove(dto.ids); }

  // 许可备案
  @UseGuards(JwtAuthGuard)
  @Get(':id/licenses')
  @ApiBearerAuth()
  @ApiOperation({ summary: '主体许可列表' })
  findLicenses(@Param('id') entityId: string) { return this.service.findLicenses(entityId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/licenses')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '添加许可' })
  addLicense(@Param('id') entityId: string, @Body() dto: CreateLicenseDto) { return this.service.addLicense(entityId, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/licenses/:lid')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '修改许可' })
  updateLicense(@Param('lid') id: string, @Body() dto: UpdateLicenseDto) { return this.service.updateLicense(id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/licenses/:lid')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除许可' })
  removeLicense(@Param('lid') id: string) { return this.service.removeLicense(id); }

  // 照片
  @UseGuards(JwtAuthGuard)
  @Get(':id/photos')
  @ApiBearerAuth()
  @ApiOperation({ summary: '主体照片列表' })
  findPhotos(@Param('id') entityId: string) { return this.service.findPhotos(entityId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/photos')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '添加照片' })
  addPhoto(@Param('id') entityId: string, @Body() dto: CreatePhotoDto) { return this.service.addPhoto(entityId, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/photos/batch')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '批量添加照片' })
  addPhotos(@Param('id') entityId: string, @Body() photos: CreatePhotoDto[]) { return this.service.addPhotos(entityId, photos); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/photos/:pid')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除照片' })
  removePhoto(@Param('pid') id: string) { return this.service.removePhoto(id); }
}
