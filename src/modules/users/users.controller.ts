import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BatchDeleteDto } from '../../common/dto/batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '用户列表' })
  findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number, @Query('role') role?: string) {
    return this.usersService.findAll(page, pageSize, role);
  }

  @Get('inspectors')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '检查员列表' })
  findInspectors() { return this.usersService.findInspectors(); }

  @Get('screeners')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '排查员列表' })
  findScreeners() { return this.usersService.findScreeners(); }

  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '创建用户' })
  create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.usersService.update(id, dto); }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: string) { return this.usersService.remove(id); }

  @Post('batch-delete')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '批量删除用户' })
  batchRemove(@Body() dto: BatchDeleteDto) { return this.usersService.batchRemove(dto.ids); }
}
