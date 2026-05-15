import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaints.dto';
import { ComplaintStatus, ComplaintCategory, Satisfaction } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateComplaintDto) {
    return this.prisma.complaint.create({
      data: {
        entityId: dto.entityId,
        category: dto.category as ComplaintCategory,
        content: dto.content,
        evidence: dto.evidence,
        isAnonymous: dto.isAnonymous || false,
        reporterName: dto.reporterName,
        reporterPhone: dto.reporterPhone,
        status: ComplaintStatus.PENDING,
      },
      include: { entity: true },
    });
  }

  async findAll(filter?: { status?: ComplaintStatus; category?: ComplaintCategory }, pagination?: { page: number; pageSize: number }) {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.category) where.category = filter.category;
    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination?.pageSize;
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: { entity: true, handles: { include: { handler: true } }, feedbacks: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.complaint.count({ where }),
    ]);
    return { items, total, page: pagination?.page || 1, pageSize: take || total };
  }

  async findConsumerList(filter?: { reporterPhone?: string; status?: ComplaintStatus }) {
    const where: any = {};
    if (filter?.reporterPhone) where.reporterPhone = filter.reporterPhone;
    if (filter?.status) where.status = filter.status;
    return this.prisma.complaint.findMany({
      where,
      select: {
        id: true, category: true, content: true, status: true,
        createdAt: true, isAnonymous: true,
        entity: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: { entity: true, handles: { include: { handler: true }, orderBy: { createdAt: 'asc' } }, feedbacks: { orderBy: { createdAt: 'asc' } } },
    });
    if (!complaint) throw new NotFoundException('投诉不存在');
    return complaint;
  }

  async update(id: string, dto: UpdateComplaintDto) {
    await this.findOne(id);
    return this.prisma.complaint.update({
      where: { id },
      data: {
        entityId: dto.entityId,
        category: dto.category as ComplaintCategory,
        content: dto.content,
        evidence: dto.evidence,
        isAnonymous: dto.isAnonymous,
        reporterName: dto.reporterName,
        reporterPhone: dto.reporterPhone,
        status: dto.status as ComplaintStatus,
      },
      include: { entity: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.complaint.delete({ where: { id } });
  }

  async batchRemove(ids: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 删除关联的处理记录和反馈
      await tx.complaintFeedback.deleteMany({ where: { complaintId: { in: ids } } });
      await tx.complaintHandle.deleteMany({ where: { complaintId: { in: ids } } });
      const result = await tx.complaint.deleteMany({ where: { id: { in: ids } } });
      return { count: result.count, ids };
    });
  }

  async firstHandle(complaintId: string, handlerId: string, result: string, photos?: string) {
    const complaint = await this.findOne(complaintId);
    if (complaint.status !== ComplaintStatus.PENDING) {
      throw new BadRequestException('当前状态不允许首次处理');
    }
    await this.prisma.complaintHandle.create({
      data: { complaintId, handlerId, handleType: 'FIRST', result, photos },
    });
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: ComplaintStatus.FIRST_HANDLING },
      include: { entity: true },
    });
  }

  async addConsumerFeedback(complaintId: string, satisfaction: string, remark?: string) {
    const complaint = await this.findOne(complaintId);
    if (complaint.status !== ComplaintStatus.FIRST_HANDLING) {
      throw new BadRequestException('当前状态不允许反馈');
    }
    const lastHandle = await this.prisma.complaintHandle.findFirst({
      where: { complaintId, handleType: 'FIRST' },
      orderBy: { createdAt: 'desc' },
    });
    await this.prisma.complaintFeedback.create({
      data: {
        complaintId,
        handleId: lastHandle?.id,
        feedbackType: 'FIRST',
        satisfaction: satisfaction as Satisfaction,
        remark,
      },
    });
    // Auto-advance to second handling if dissatisfied or needs intervention
    if (satisfaction === 'DISSATISFIED' || satisfaction === 'NEED_INTERVENTION') {
      // Notify admin users about the escalation
      const admins = await this.prisma.sysUser.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'INSPECTOR'] as any }, status: 'ACTIVE' },
        select: { id: true },
      });
      const entity = complaint.entity;
      const notifyContent = `投诉 #${complaintId} 消费者不满意，需要监管人员介入处理。` + (entity ? ` 经营主体: ${entity.name}` : '');
      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            title: '投诉需要二次处理',
            content: notifyContent,
            type: 'COMPLAINT' as any,
            relatedId: complaintId,
            relatedType: 'Complaint',
          },
        });
      }
      return this.prisma.complaint.update({
        where: { id: complaintId },
        data: { status: ComplaintStatus.SECOND_HANDLING },
        include: { entity: true },
      });
    }

    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: ComplaintStatus.FIRST_FEEDBACK },
      include: { entity: true },
    });
  }

  async secondHandle(complaintId: string, handlerId: string, result: string, photos?: string) {
    const complaint = await this.findOne(complaintId);
    if (complaint.status !== ComplaintStatus.SECOND_HANDLING) {
      throw new BadRequestException('当前状态不允许二次处理');
    }
    await this.prisma.complaintHandle.create({
      data: { complaintId, handlerId, handleType: 'SECOND', result, photos },
    });
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: ComplaintStatus.SECOND_HANDLING },
      include: { entity: true },
    });
  }

  async addSecondFeedback(complaintId: string, satisfaction: string, remark?: string) {
    const complaint = await this.findOne(complaintId);
    if (complaint.status !== ComplaintStatus.SECOND_HANDLING) {
      throw new BadRequestException('当前状态不允许二次反馈');
    }
    const lastHandle = await this.prisma.complaintHandle.findFirst({
      where: { complaintId, handleType: 'SECOND' },
      orderBy: { createdAt: 'desc' },
    });
    await this.prisma.complaintFeedback.create({
      data: {
        complaintId,
        handleId: lastHandle?.id,
        feedbackType: 'SECOND',
        satisfaction: satisfaction as Satisfaction,
        remark,
      },
    });
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: satisfaction === 'SATISFIED' ? ComplaintStatus.RESOLVED : ComplaintStatus.SECOND_FEEDBACK },
      include: { entity: true },
    });
  }
}
