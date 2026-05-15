import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRectificationDto, SubmitRectificationDto, ReviewRectificationDto } from './dto/rectifications.dto';

@Injectable()
export class RectificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRectificationDto) {
    const record = await this.prisma.inspectionRecord.findUnique({ where: { id: dto.recordId } });
    if (!record) throw new NotFoundException('检查记录不存在');

    const item = await this.prisma.rectification.create({
      data: {
        recordId: dto.recordId,
        entityId: dto.entityId,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        level: (dto.level || 'LOW') as any,
        status: 'PENDING' as any,
      },
      include: { record: true, entity: true },
    });

    // Notify entity operator about new rectification
    const operators = await this.prisma.sysUser.findMany({
      where: { role: 'OPERATOR' as any, status: 'ACTIVE' },
      select: { id: true },
    });
    for (const op of operators) {
      await this.prisma.notification.create({
        data: {
          userId: op.id,
          title: '新整改任务',
          content: `您有一条新的整改任务: ${dto.description}`,
          type: 'INSPECTION' as any,
          relatedId: item.id,
          relatedType: 'Rectification',
        },
      });
    }

    return item;
  }

  async findAll(filter?: { entityId?: string; status?: string; level?: string }, pagination?: { page: number; pageSize: number }) {
    const where: any = {};
    if (filter?.entityId) where.entityId = filter.entityId;
    if (filter?.status) where.status = filter.status;
    if (filter?.level) where.level = filter.level;

    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination?.pageSize;

    const [items, total] = await Promise.all([
      this.prisma.rectification.findMany({
        where,
        include: {
          record: { include: { inspector: { select: { id: true, realName: true } } } },
          entity: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.rectification.count({ where }),
    ]);

    return { items, total, page: pagination?.page || 1, pageSize: take || total };
  }

  async findByEntity(entityId: string) {
    return this.prisma.rectification.findMany({
      where: { entityId },
      include: { record: true, entity: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.rectification.findUnique({
      where: { id },
      include: {
        record: { include: { inspector: { select: { id: true, realName: true } }, itemResults: true } },
        entity: true,
      },
    });
    if (!item) throw new NotFoundException('整改记录不存在');
    return item;
  }

  async submit(id: string, dto: SubmitRectificationDto) {
    const item = await this.findOne(id);
    if (item.status !== 'PENDING' && item.status !== 'REJECTED') {
      throw new BadRequestException('当前状态不允许提交');
    }

    const updated = await this.prisma.rectification.update({
      where: { id },
      data: {
        status: 'SUBMITTED' as any,
        submitDescription: dto.submitDescription,
        submitPhotos: dto.submitPhotos,
        submittedAt: new Date(),
      },
      include: { record: true, entity: true },
    });

    // Notify inspectors about rectification submission
    const inspectors = await this.prisma.sysUser.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'INSPECTOR'] as any }, status: 'ACTIVE' },
      select: { id: true },
    });
    for (const ins of inspectors) {
      await this.prisma.notification.create({
        data: {
          userId: ins.id,
          title: '整改已提交',
          content: `经营主体「${item.entity.name}」已提交整改，等待审核。`,
          type: 'INSPECTION' as any,
          relatedId: id,
          relatedType: 'Rectification',
        },
      });
    }

    return updated;
  }

  async review(id: string, reviewerId: string, dto: ReviewRectificationDto) {
    const item = await this.findOne(id);
    if (item.status !== 'SUBMITTED') {
      throw new BadRequestException('当前状态不允许审核');
    }

    // LOW level: online review; HIGH level: should be on-site
    const level = item.level as string;
    const auditNote = level === 'HIGH' && dto.reviewResult === 'APPROVED'
      ? '（注：高风险整改建议现场核实）'
      : '';

    const updated = await this.prisma.rectification.update({
      where: { id },
      data: {
        status: (dto.reviewResult === 'APPROVED' ? 'APPROVED' : 'REJECTED') as any,
        reviewerId,
        reviewResult: dto.reviewResult,
        reviewRemark: dto.reviewRemark + auditNote,
        reviewedAt: new Date(),
      },
      include: { record: true, entity: true },
    });

    // Notify operator about review result
    const operators = await this.prisma.sysUser.findMany({
      where: { role: 'OPERATOR' as any, status: 'ACTIVE' },
      select: { id: true },
    });
    for (const op of operators) {
      await this.prisma.notification.create({
        data: {
          userId: op.id,
          title: dto.reviewResult === 'APPROVED' ? '整改已通过' : '整改已驳回',
          content: dto.reviewResult === 'APPROVED'
            ? `您提交的整改已通过审核。${auditNote}`
            : `您提交的整改未通过审核，原因: ${dto.reviewRemark || '请重新整改'}`,
          type: 'INSPECTION' as any,
          relatedId: id,
          relatedType: 'Rectification',
        },
      });
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rectification.delete({ where: { id } });
  }

  async batchRemove(ids: string[]) {
    const result = await this.prisma.rectification.deleteMany({ where: { id: { in: ids } } });
    return { count: result.count, ids };
  }

  async batchReview(ids: string[], reviewerId: string, reviewResult: string, reviewRemark?: string) {
    const results: any[] = [];
    for (const id of ids) {
      try {
        const item = await this.prisma.rectification.findUnique({ where: { id } });
        if (!item || item.status !== 'SUBMITTED') continue;
        const updated = await this.prisma.rectification.update({
          where: { id },
          data: {
            status: (reviewResult === 'APPROVED' ? 'APPROVED' : 'REJECTED') as any,
            reviewerId,
            reviewResult,
            reviewRemark,
            reviewedAt: new Date(),
          },
        });
        results.push(updated);
      } catch { continue; }
    }
    return { count: results.length, ids };
  }
}
