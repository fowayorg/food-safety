import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetStatsDto } from './get-stats.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // 检查统计报表
  async getInspectionStats(dto: GetStatsDto) {
    const where: any = {};
    if (dto.startDate && dto.endDate) {
      where.inspectedAt = {
        gte: new Date(dto.startDate),
        lte: new Date(dto.endDate + 'T23:59:59'),
      };
    }
    if (dto.streetId) {
      where.entity = { streetId: dto.streetId };
    }

    const [total, byStatus, byType] = await Promise.all([
      this.prisma.inspectionRecord.count({ where }),
      this.prisma.inspectionRecord.groupBy({
        by: ['result'],
        where,
        _count: { result: true },
      }),
      this.prisma.inspectionRecord.groupBy({
        by: ['planId'],
        where,
        _count: { planId: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        result: item.result,
        count: item._count.result,
      })),
      byPlan: byType.map((item) => ({
        planId: item.planId,
        count: item._count.planId,
      })),
    };
  }

  // 投诉举报统计报表
  async getComplaintStats(dto: GetStatsDto) {
    const where: any = {};
    if (dto.startDate && dto.endDate) {
      where.createdAt = {
        gte: new Date(dto.startDate),
        lte: new Date(dto.endDate + 'T23:59:59'),
      };
    }

    const [total, byStatus, byCategory] = await Promise.all([
      this.prisma.complaint.count({ where }),
      this.prisma.complaint.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.complaint.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count.category,
      })),
    };
  }

  // 主体统计报表
  async getEntityStats(dto: GetStatsDto) {
    const where: any = {};
    if (dto.streetId) {
      where.streetId = dto.streetId;
    }

    const [total, byType, riskCount] = await Promise.all([
      this.prisma.bizEntity.count({ where }),
      this.prisma.bizEntity.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      this.prisma.bizEntity.groupBy({
        by: ['riskLevel'],
        where,
        _count: { riskLevel: true },
      }),
    ]);

    return {
      total,
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      riskDistribution: riskCount.map((item) => ({
        riskLevel: item.riskLevel,
        count: item._count.riskLevel,
      })),
    };
  }

  // Dashboard 总览统计
  async getDashboardStats() {
    const [entityCount, inspectionCount, pendingComplaints, assignedTasks] =
      await Promise.all([
        this.prisma.bizEntity.count(),
        this.prisma.inspectionRecord.count(),
        this.prisma.complaint.count({
          where: {
            status: { notIn: ['RESOLVED', 'CLOSED'] },
          },
        }),
        this.prisma.inspectionTask.count({ where: { status: 'ASSIGNED' } }),
      ]);

    return {
      totalEntities: entityCount,
      totalInspections: inspectionCount,
      pendingComplaints,
      assignedTasks,
    };
  }
}
