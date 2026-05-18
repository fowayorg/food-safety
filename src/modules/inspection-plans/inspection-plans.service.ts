import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInspectionPlanDto } from './dto/create-inspection-plan.dto';
import { UpdateInspectionPlanDto } from './dto/update-inspection-plan.dto';
import { PlanStatus } from '@prisma/client';

@Injectable()
export class InspectionPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateInspectionPlanDto, userId?: string) {
    return this.prisma.inspectionPlan.create({
      data: {
        name: createDto.name,
        type: createDto.type,
        templateId: createDto.templateId,
        legalBasis: createDto.legalBasis,
        startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
        endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
        description: createDto.description,
        status: PlanStatus.DRAFT,
        createdBy: userId,
      },
      include: { template: true, creator: true, tasks: true },
    });
  }

  async findAll(status?: PlanStatus) {
    const where = status ? { status } : {};
    return this.prisma.inspectionPlan.findMany({
      where,
      include: { template: true, creator: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.inspectionPlan.findUnique({
      where: { id },
      include: { template: true, creator: true, tasks: { include: { entity: true, inspector: true } } },
    });
    if (!plan) throw new NotFoundException('检查计划不存在');
    return plan;
  }

  async update(id: string, updateDto: UpdateInspectionPlanDto) {
    await this.findOne(id);
    const data: any = { ...updateDto };
    if (updateDto.startDate) data.startDate = new Date(updateDto.startDate);
    if (updateDto.endDate) data.endDate = new Date(updateDto.endDate);
    return this.prisma.inspectionPlan.update({
      where: { id },
      data,
      include: { template: true, creator: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inspectionPlan.delete({ where: { id } });
  }

  async changeStatus(id: string, status: PlanStatus) {
    const plan = await this.findOne(id);
    const validTransitions: Record<string, PlanStatus[]> = {
      DRAFT: ['PUBLISHED', 'CANCELLED'],
      PUBLISHED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    };
    const allowed = validTransitions[plan.status as string];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`计划状态不允许从 ${plan.status} 变更为 ${status}`);
    }
    return this.prisma.inspectionPlan.update({
      where: { id },
      data: { status },
      include: { template: true, creator: true },
    });
  }

  async assignTasks(planId: string, tasks: { entityId: string; inspectorId: string; scheduledDate?: string }[]) {
    await this.findOne(planId);
    const plan = await this.prisma.inspectionPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== PlanStatus.PUBLISHED) {
      throw new BadRequestException('只能对已发布的计划分配任务');
    }
    const data = tasks.map((t) => ({
      planId,
      entityId: t.entityId,
      inspectorId: t.inspectorId,
      scheduledDate: t.scheduledDate ? new Date(t.scheduledDate) : undefined,
      status: 'ASSIGNED' as any,
    }));
    const result = await this.prisma.inspectionTask.createMany({ data });
    return { created: result.count };
  }

  async getTasks(planId: string, status?: string) {
    await this.findOne(planId);
    return this.prisma.inspectionTask.findMany({
      where: { planId, status: status as any },
      include: { entity: true, inspector: true, record: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanStats(planId: string) {
    const plan = await this.findOne(planId);
    const tasks = await this.prisma.inspectionTask.findMany({ where: { planId } });
    const total = tasks.length;
    const assigned = tasks.filter((t) => t.status === 'ASSIGNED').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    return { total, assigned, inProgress, completed, completionRate: total ? Math.round((completed / total) * 100) : 0 };
  }

  async getMyTasks(inspectorId: string, status?: string) {
    return this.prisma.inspectionTask.findMany({
      where: { inspectorId, ...(status ? { status: status as any } : {}) },
      include: { entity: true, plan: true, record: true },
      orderBy: { scheduledDate: 'asc' },
    });
  }
}
