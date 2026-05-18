import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activities.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.activity.findMany({
      where: status ? { status: status as any } : {},
      include: {
        creator: true,
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublic(status?: string) {
    const where: any = {
      status: status ? (status as any) : { in: ['PUBLISHED', 'ACTIVE', 'ENDED'] },
    };
    const activities = await this.prisma.activity.findMany({
      where,
      include: { _count: { select: { participants: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return activities.map(({ creator, ...rest }: any) => rest);
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { creator: true, participants: true },
    });
    if (!activity) throw new NotFoundException('活动不存在');
    return activity;
  }

  async create(dto: CreateActivityDto, userId?: string) {
    return this.prisma.activity.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        config: dto.config,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        targetAudience: dto.targetAudience || 'ALL',
        status: 'DRAFT',
        createdBy: userId,
      },
      include: { creator: true },
    });
  }

  async update(id: string, dto: UpdateActivityDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.activity.update({
      where: { id },
      data,
      include: { creator: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.activity.delete({ where: { id } });
  }

  async publish(id: string) {
    const activity = await this.findOne(id);
    if (activity.status !== 'DRAFT' && activity.status !== 'CANCELLED') {
      throw new BadRequestException('只能发布草稿或已取消的活动');
    }
    const newStatus = activity.startDate && new Date(activity.startDate) > new Date() ? 'PUBLISHED' : 'ACTIVE';
    const updated = await this.prisma.activity.update({
      where: { id },
      data: { status: newStatus },
      include: { creator: true },
    });

    // Activity type label map
    const typeMap: Record<string, string> = { VOTE: '投票活动', SUGGESTION: '意见建议', PROMOTION: '促销活动', SURVEY: '问卷调查' };
    const typeLabel = typeMap[activity.type] || activity.type;

    // Auto-create notification filtered by targetAudience
    const audienceMap: Record<string, any> = {
      ALL: {},
      OPERATOR: { role: 'OPERATOR' },
      CONSUMER: { role: 'CONSUMER' },
    };
    const audienceFilter = audienceMap[activity.targetAudience] || {};
    const users = await this.prisma.sysUser.findMany({
      where: { status: 'ACTIVE', ...audienceFilter },
      select: { id: true },
    });

    const startInfo = activity.startDate ? `，开始时间：${new Date(activity.startDate).toLocaleDateString('zh-CN')}` : '';
    const notifTitle = `【${typeLabel}】${activity.name}`;
    const notifContent = activity.description || `您有一条新的${typeLabel}等待参与${startInfo}。`;

    for (const u of users) {
      await this.prisma.notification.create({
        data: {
          userId: u.id,
          title: notifTitle,
          content: notifContent,
          type: 'ACTIVITY' as any,
          relatedId: id,
          relatedType: 'Activity',
        },
      });
    }
    return updated;
  }

  async participate(id: string, body: { userId?: string; participantName?: string; participantPhone?: string; content?: string }) {
    const activity = await this.findOne(id);
    if (activity.status !== 'ACTIVE' && activity.status !== 'PUBLISHED') {
      throw new BadRequestException('活动未开放参与');
    }
    return this.prisma.activityParticipant.create({
      data: {
        activityId: id,
        userId: body.userId,
        participantName: body.participantName,
        participantPhone: body.participantPhone,
        content: body.content,
      },
    });
  }

  async getParticipants(id: string) {
    await this.findOne(id);
    return this.prisma.activityParticipant.findMany({
      where: { activityId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(id: string) {
    const activity = await this.findOne(id);
    const participantCount = await this.prisma.activityParticipant.count({ where: { activityId: id } });
    return {
      participantCount,
      status: activity.status,
      startDate: activity.startDate,
      endDate: activity.endDate,
    };
  }
}
