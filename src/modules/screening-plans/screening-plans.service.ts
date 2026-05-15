import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateScreeningPlanDto } from './dto/screening-plan.dto';

@Injectable()
export class ScreeningPlansService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([this.prisma.screeningPlan.findMany({ skip: (page-1)*pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }), this.prisma.screeningPlan.count()]);
    return { items, total, page, pageSize };
  }
  async findOne(id: string) { const r = await this.prisma.screeningPlan.findUnique({ where: { id }, include: { records: true } }); if (!r) throw new NotFoundException(); return r; }
  create(dto: CreateScreeningPlanDto, userId: string) { return this.prisma.screeningPlan.create({ data: { ...dto, createdBy: userId } }); }
  update(id: string, dto: Partial<CreateScreeningPlanDto>) { return this.prisma.screeningPlan.update({ where: { id }, data: dto }); }
  remove(id: string) { return this.prisma.screeningPlan.delete({ where: { id } }); }
  publish(id: string) { return this.prisma.screeningPlan.update({ where: { id }, data: { status: 'PUBLISHED' } }); }
  cancel(id: string) { return this.prisma.screeningPlan.update({ where: { id }, data: { status: 'CANCELLED' } }); }
}
