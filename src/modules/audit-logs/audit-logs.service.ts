import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryAuditLogDto } from './dto/audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId?: string;
    action: string;
    module: string;
    targetId?: string;
    targetType?: string;
    detail?: string;
    ip?: string;
    userAgent?: string;
    status?: string;
    errorMsg?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        module: data.module,
        targetId: data.targetId,
        targetType: data.targetType,
        detail: data.detail,
        ip: data.ip,
        userAgent: data.userAgent,
        status: data.status || 'SUCCESS',
        errorMsg: data.errorMsg,
      },
    });
  }

  async findAll(query: QueryAuditLogDto) {
    const { userId, action, module, targetId, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (module) where.module = module;
    if (targetId) where.targetId = targetId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, realName: true, username: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, realName: true, username: true, role: true },
        },
      },
    });
  }

  async getStats() {
    const total = await this.prisma.auditLog.count();
    const byAction = await this.prisma.auditLog.groupBy({
      by: ['action'],
      _count: true,
    });
    const byModule = await this.prisma.auditLog.groupBy({
      by: ['module'],
      _count: true,
    });
    const todayCount = await this.prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      total,
      todayCount,
      actionBreakdown: byAction.map((a) => ({ action: a.action, count: a._count })),
      moduleBreakdown: byModule.map((m) => ({ module: m.module, count: m._count })),
    };
  }
}