import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { FeedbackCategory } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        userId: dto.userId,
        category: dto.category as FeedbackCategory,
        content: dto.content,
        contact: dto.contact,
        status: 'PENDING',
      },
      include: { user: true, replier: true },
    });
  }

  async findAll(
    filter?: { status?: string; category?: FeedbackCategory },
    pagination?: { page: number; pageSize: number },
  ) {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.category) where.category = filter.category;
    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination?.pageSize;
    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: { user: true, replier: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.feedback.count({ where }),
    ]);
    return { items, total, page: pagination?.page || 1, pageSize: take || total };
  }

  async findOne(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: { user: true, replier: true },
    });
    if (!feedback) throw new NotFoundException('反馈不存在');
    return feedback;
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    await this.findOne(id);
    return this.prisma.feedback.update({
      where: { id },
      data: {
        category: dto.category as FeedbackCategory,
        content: dto.content,
        contact: dto.contact,
        status: dto.status,
      },
      include: { user: true, replier: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.feedback.delete({ where: { id } });
  }

  async reply(id: string, userId: string, reply: string) {
    await this.findOne(id);
    return this.prisma.feedback.update({
      where: { id },
      data: {
        reply,
        repliedBy: userId,
        repliedAt: new Date(),
        status: 'REPLIED',
      },
      include: { user: true, replier: true },
    });
  }
}
