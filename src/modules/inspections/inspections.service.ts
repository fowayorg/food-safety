import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInspectionDto, UpdateInspectionDto } from './dto/inspections.dto';
import { InspectionResult, RiskLevel, RectificationLevel } from '@prisma/client';

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  /** Calculate risk level based on recent inspection scores */
  private async recalcEntityRisk(entityId: string) {
    const recentRecords = await this.prisma.inspectionRecord.findMany({
      where: { entityId },
      orderBy: { inspectedAt: 'desc' },
      take: 5,
      select: { result: true, totalScore: true },
    });
    if (recentRecords.length === 0) return;

    const failCount = recentRecords.filter((r) => r.result === 'FAIL').length;
    const avgScore = Math.round(recentRecords.reduce((s, r) => s + (r.totalScore || 0), 0) / recentRecords.length);

    let riskLevel: RiskLevel;
    if (failCount >= 3 || avgScore < 40) riskLevel = RiskLevel.HIGH;
    else if (failCount >= 2 || avgScore < 60) riskLevel = RiskLevel.HIGHER;
    else if (failCount >= 1 || avgScore < 75) riskLevel = RiskLevel.MEDIUM;
    else if (avgScore >= 90) riskLevel = RiskLevel.LOW;
    else riskLevel = RiskLevel.LOWER;

    await this.prisma.bizEntity.update({
      where: { id: entityId },
      data: { riskLevel, riskScore: avgScore, riskRatedAt: new Date() },
    });
  }

  /**
   * P1-4: 检查记录自动关联整改待办
   * 当检查结果为 FAIL 或 ISSUE 时，自动创建整改记录
   */
  private async autoCreateRectification(recordId: string, entityId: string, result: string, summary?: string) {
    if (result !== InspectionResult.FAIL && result !== InspectionResult.ISSUE) return;

    // 检查是否已存在关联的整改记录（避免重复创建）
    const existing = await this.prisma.rectification.findFirst({
      where: { recordId, status: 'PENDING' },
    });
    if (existing) return;

    // 根据检查结果确定整改级别
    let level: RectificationLevel = RectificationLevel.LOW;
    if (result === InspectionResult.FAIL) {
      level = RectificationLevel.HIGH;
    } else if (result === InspectionResult.ISSUE) {
      level = RectificationLevel.MEDIUM;
    }

    // 截止日期：HIGH=7天, MEDIUM=15天, LOW=30天
    const deadline = new Date();
    if (level === RectificationLevel.HIGH) deadline.setDate(deadline.getDate() + 7);
    else if (level === RectificationLevel.MEDIUM) deadline.setDate(deadline.getDate() + 15);
    else deadline.setDate(deadline.getDate() + 30);

    const entity = await this.prisma.bizEntity.findUnique({
      where: { id: entityId },
      select: { name: true },
    });

    await this.prisma.rectification.create({
      data: {
        recordId,
        entityId,
        description: `${result === InspectionResult.FAIL ? '检查不合格' : '检查发现问题'}：${summary || entity?.name || '待整改'}`,
        deadline,
        level,
        status: 'PENDING',
      },
    });
  }

  async create(dto: CreateInspectionDto) {
    // 获取 task 信息以确认 entityId
    const task = dto.taskId
      ? await this.prisma.inspectionTask.findUnique({ where: { id: dto.taskId }, select: { entityId: true } }).catch(() => null)
      : null;
    const entityId = task?.entityId;

    const data: any = {
      taskId: dto.taskId,
      entityId,
      description: dto.description,
      photos: dto.photos,
      signature: dto.signature,
      location: dto.location,
      spotCheck: dto.spotCheck,
      geoLocation: dto.geoLocation,
    };
    if (dto.result) data.result = dto.result;
    if (dto.itemResults && dto.itemResults.length > 0) {
      data.itemResults = {
        create: dto.itemResults.map((item) => ({
          itemId: item.itemId,
          result: item.result as any,
          notes: item.notes,
        })),
      };
    }
    const record = await this.prisma.inspectionRecord.create({
      data,
      include: { task: true, itemResults: true },
    });

    // 重新计算风险等级
    if (entityId) this.recalcEntityRisk(entityId).catch(() => {});

    // P1-4: 检查结果为 FAIL/ISSUE 时自动创建整改待办
    if (record.result && entityId) {
      this.autoCreateRectification(record.id, entityId, record.result, dto.description).catch(() => {});
    }

    return record;
  }

  async findAll() {
    return this.prisma.inspectionRecord.findMany({
      include: {
        task: true,
        itemResults: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.inspectionRecord.findUnique({
      where: { id },
      include: {
        task: true,
        itemResults: true,
      },
    });
    if (!record) throw new NotFoundException(`InspectionRecord with ID ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateInspectionDto) {
    const existing = await this.findOne(id);
    const data: any = {};
    if (dto.result) data.result = dto.result;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.photos !== undefined) data.photos = dto.photos;
    if (dto.signature !== undefined) data.signature = dto.signature;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.spotCheck !== undefined) data.spotCheck = dto.spotCheck;
    if (dto.geoLocation !== undefined) data.geoLocation = dto.geoLocation;
    if (dto.status) data.status = dto.status;
    if (dto.itemResults && dto.itemResults.length > 0) {
      data.itemResults = {
        deleteMany: {},
        create: dto.itemResults.map((item) => ({
          itemId: item.itemId,
          result: item.result as any,
          notes: item.notes,
        })),
      };
    }
    const record = await this.prisma.inspectionRecord.update({
      where: { id },
      data,
      include: { task: true, itemResults: true },
    });
    const entityId = record.entityId || record.task?.entityId;
    if (entityId) this.recalcEntityRisk(entityId).catch(() => {});

    // P1-4: 更新检查结果时，如果变为 FAIL/ISSUE 也自动创建整改待办
    if (dto.result && entityId) {
      this.autoCreateRectification(record.id, entityId, dto.result, dto.description).catch(() => {});
    }

    return record;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inspectionRecord.delete({
      where: { id },
    });
  }

  async batchRemove(ids: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 先删除关联的整改记录
      await tx.rectification.deleteMany({ where: { recordId: { in: ids } } });
      await tx.inspectionItemResult.deleteMany({ where: { recordId: { in: ids } } });
      const result = await tx.inspectionRecord.deleteMany({ where: { id: { in: ids } } });
      return { count: result.count, ids };
    });
  }
}
