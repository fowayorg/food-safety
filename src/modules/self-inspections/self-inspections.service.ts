import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSelfInspectionDto, UpdateSelfInspectionDto } from './dto/self-inspections.dto';
import { SelfInspectionType } from '@prisma/client';

@Injectable()
export class SelfInspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSelfInspectionDto, operatorId: string) {
    return this.prisma.selfInspection.create({
      data: {
        entityId: dto.entityId,
        operatorId: operatorId,
        type: dto.type as SelfInspectionType,
        items: dto.items,
        issues: dto.issues,
        result: dto.result || 'PASS',
        photos: dto.photos,
        inspectedAt: dto.inspectedAt ? new Date(dto.inspectedAt) : new Date(),
      },
      include: { entity: true, operator: true },
    });
  }

  async findAll(
    filter?: { type?: SelfInspectionType; entityId?: string },
    pagination?: { page: number; pageSize: number },
  ) {
    const where: any = {};
    if (filter?.type) where.type = filter.type as SelfInspectionType;
    if (filter?.entityId) where.entityId = filter.entityId;
    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination?.pageSize;
    const [items, total] = await Promise.all([
      this.prisma.selfInspection.findMany({
        where,
        include: { entity: true, operator: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.selfInspection.count({ where }),
    ]);
    return { items, total, page: pagination?.page || 1, pageSize: take || total };
  }

  async findMy(userId: string) {
    return this.prisma.selfInspection.findMany({
      where: { operatorId: userId },
      include: { entity: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inspection = await this.prisma.selfInspection.findUnique({
      where: { id },
      include: { entity: true, operator: true },
    });
    if (!inspection) throw new NotFoundException('自查记录不存在');
    return inspection;
  }

  async update(id: string, dto: UpdateSelfInspectionDto) {
    await this.findOne(id);
    return this.prisma.selfInspection.update({
      where: { id },
      data: {
        entityId: dto.entityId,
        type: dto.type as SelfInspectionType,
        items: dto.items,
        issues: dto.issues,
        result: dto.result,
        photos: dto.photos,
        inspectedAt: dto.inspectedAt ? new Date(dto.inspectedAt) : undefined,
      },
      include: { entity: true, operator: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.selfInspection.delete({ where: { id } });
  }

  async submit(id: string) {
    const inspection = await this.findOne(id);
    return this.prisma.selfInspection.update({
      where: { id },
      data: { result: 'SUBMITTED', inspectedAt: new Date() },
      include: { entity: true, operator: true },
    });
  }
}
