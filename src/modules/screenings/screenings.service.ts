import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateScreeningRecordDto, UpdateScreeningRecordDto } from './dto/screenings.dto';
import { RiskLevel } from '@prisma/client';

@Injectable()
export class ScreeningsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Calculate risk level based on recent screening + inspection records */
  private async recalcEntityRisk(entityId: string) {
    const [screenings, inspections] = await Promise.all([
      this.prisma.screeningRecord.findMany({ where: { entityId }, orderBy: { screenedAt: 'desc' }, take: 5, select: { riskLevel: true } }),
      this.prisma.inspectionRecord.findMany({ where: { entityId }, orderBy: { inspectedAt: 'desc' }, take: 5, select: { result: true, totalScore: true } }),
    ]);

    // Screening risk score: HIGH=0, HIGHER=25, MEDIUM=50, LOW=75, UNRATED/LOWER=100
    const riskScoreMap: Record<string, number> = {
      HIGH: 0, HIGHER: 25, MEDIUM: 50, LOW: 75, LOWER: 100, UNRATED: 100,
    };
    const screeningAvg = screenings.length
      ? screenings.reduce((s, r) => s + (riskScoreMap[r.riskLevel as string] ?? 100), 0) / screenings.length
      : 100;
    const inspectionAvg = inspections.length
      ? inspections.reduce((s, r) => s + (r.totalScore ?? 100), 0) / inspections.length
      : 100;
    const avgScore = (screeningAvg * 0.4 + inspectionAvg * 0.6); // screenings weight 40%, inspections weight 60%


    let riskLevel: RiskLevel;
    if (avgScore < 40) riskLevel = RiskLevel.HIGH;
    else if (avgScore < 60) riskLevel = RiskLevel.HIGHER;
    else if (avgScore < 75) riskLevel = RiskLevel.MEDIUM;
    else if (avgScore < 90) riskLevel = RiskLevel.LOWER;
    else riskLevel = RiskLevel.LOW;


    await this.prisma.bizEntity.update({ where: { id: entityId }, data: { riskLevel, riskRatedAt: new Date() } });
  }

  async create(dto: CreateScreeningRecordDto, userId: string) {
    const record = await this.prisma.screeningRecord.create({
      data: {
        planId: dto.planId,
        entityId: dto.entityId,
        screenerId: userId,
        infoVerified: dto.infoVerified ?? false,
        riskLevel: dto.riskLevel as any,
        issues: dto.issues,
        photos: dto.photos,
        notes: dto.notes,
        screenedAt: dto.screenedAt ? new Date(dto.screenedAt) : new Date(),
      },
      include: { entity: true, screener: true, plan: true },
    });
    // Auto-recalculate entity risk level
    this.recalcEntityRisk(dto.entityId).catch(() => {});
    return record;
  }

  async findAll(
    filter?: { entityId?: string; screenerId?: string; planId?: string },
    pagination?: { page: number; pageSize: number },
  ) {
    const where: any = {};
    if (filter?.entityId) where.entityId = filter.entityId;
    if (filter?.screenerId) where.screenerId = filter.screenerId;
    if (filter?.planId) where.planId = filter.planId;
    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination?.pageSize;
    const [items, total] = await Promise.all([
      this.prisma.screeningRecord.findMany({
        where,
        include: { entity: true, screener: true, plan: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.screeningRecord.count({ where }),
    ]);
    return { items, total, page: pagination?.page || 1, pageSize: take || total };
  }

  async findOne(id: string) {
    const record = await this.prisma.screeningRecord.findUnique({
      where: { id },
      include: { entity: true, screener: true, plan: true },
    });
    if (!record) throw new NotFoundException('排查记录不存在');
    return record;
  }

  async update(id: string, dto: UpdateScreeningRecordDto) {
    const existing = await this.findOne(id);
    const record = await this.prisma.screeningRecord.update({
      where: { id },
      data: {
        infoVerified: dto.infoVerified,
        riskLevel: dto.riskLevel as any,
        issues: dto.issues,
        photos: dto.photos,
        notes: dto.notes,
        screenedAt: dto.screenedAt ? new Date(dto.screenedAt) : undefined,
      },
      include: { entity: true, screener: true, plan: true },
    });
    // Auto-recalculate entity risk level
    this.recalcEntityRisk(existing.entityId).catch(() => {});
    return record;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.screeningRecord.delete({ where: { id } });
  }
}
