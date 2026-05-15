import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { QrcodesService } from './qrcodes.service';
import { CreateQrcodeDto, UpdateQrcodeDto, VerifyQrcodeDto } from './dto/qrcodes.dto';

@ApiTags('qrcodes')
@Controller('qrcodes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QrcodesController {
  constructor(private readonly service: QrcodesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '生成二维码' })
  create(@Body() dto: CreateQrcodeDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有二维码' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '获取二维码详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '更新二维码' })
  update(@Param('id') id: string, @Body() dto: UpdateQrcodeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除二维码' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('regenerate/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '重新生成二维码' })
  async regenerate(@Param('id') id: string) {
    const existing = await this.service.findOne(id);
    // Format: QY + 6-digit area code + 8-digit serial
    const code = 'QY' + Math.random().toString().substring(2, 8) + Math.random().toString().substring(2, 10);
    return this.service.update(id, { entityId: existing.entityId, code });
  }

  @Post(':id/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSPECTOR)
  @ApiOperation({ summary: '核销核验二维码' })
  async verify(@Param('id') id: string, @Body() dto: VerifyQrcodeDto, @Request() req: any) {
    const user = req.user;
    return this.service.verify(id, dto, user?.id, user?.realName || user?.username);
  }
}
