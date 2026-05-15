import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InspectionPlansService } from './inspection-plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateInspectionPlanDto } from './dto/create-inspection-plan.dto';
import { UpdateInspectionPlanDto } from './dto/update-inspection-plan.dto';
import { PlanStatus, UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('检查计划')
@Controller('inspection-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InspectionPlansController {
  constructor(private readonly service: InspectionPlansService) {}

  @Get()
  @ApiOperation({ summary: '计划列表' })
  findAll(@Query('status') status?: PlanStatus) {
    return this.service.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: '计划详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '创建计划' })
  create(@Body() createDto: CreateInspectionPlanDto, @CurrentUser() user: any) {
    return this.service.create(createDto, user.userId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '更新计划' })
  update(@Param('id') id: string, @Body() updateDto: UpdateInspectionPlanDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '删除计划' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '发布计划' })
  publish(@Param('id') id: string) {
    return this.service.changeStatus(id, 'PUBLISHED');
  }

  @Post(':id/start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '开始执行' })
  start(@Param('id') id: string) {
    return this.service.changeStatus(id, 'IN_PROGRESS');
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '完成计划' })
  complete(@Param('id') id: string) {
    return this.service.changeStatus(id, 'COMPLETED');
  }

  @Post(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '取消计划' })
  cancel(@Param('id') id: string) {
    return this.service.changeStatus(id, 'CANCELLED');
  }

  @Post(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: '分配任务' })
  assign(
    @Param('id') id: string,
    @Body() body: { tasks: { entityId: string; inspectorId: string; scheduledDate?: string }[] },
  ) {
    return this.service.assignTasks(id, body.tasks);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: '计划下任务列表' })
  getTasks(@Param('id') id: string, @Query('status') status?: string) {
    return this.service.getTasks(id, status);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '计划执行统计' })
  getStats(@Param('id') id: string) {
    return this.service.getPlanStats(id);
  }
}
