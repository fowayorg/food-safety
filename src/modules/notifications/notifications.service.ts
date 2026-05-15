import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notifications.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        content: dto.content,
        type: dto.type as NotificationType,
        relatedId: dto.relatedId,
        relatedType: dto.relatedType,
        isRead: false,
      },
    });
  }

  async findAll(
    filter?: { userId?: string; isRead?: boolean; type?: string },
    pagination?: { page: number; pageSize: number },
  ) {
    const where: any = {};
    if (filter?.userId) where.userId = filter.userId;
    if (filter?.isRead !== undefined) where.isRead = filter.isRead;
    if (filter?.type) where.type = filter.type as NotificationType;
    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination?.pageSize;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: { user: { select: { id: true, realName: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total, page: pagination?.page || 1, pageSize: take || total };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: { user: { select: { id: true, realName: true, role: true } } },
    });
    if (!notification) throw new NotFoundException('通知不存在');
    return notification;
  }

  async update(id: string, dto: UpdateNotificationDto) {
    await this.findOne(id);
    return this.prisma.notification.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type as NotificationType,
        relatedId: dto.relatedId,
        relatedType: dto.relatedType,
        isRead: dto.isRead,
      },
    });
  }

  async markAsRead(id: string) {
    await this.findOne(id);
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.notification.delete({ where: { id } });
  }

  async batchMarkRead(ids: string[]) {
    const result = await this.prisma.notification.updateMany({
      where: { id: { in: ids }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  async batchRemove(ids: string[]) {
    const result = await this.prisma.notification.deleteMany({
      where: { id: { in: ids } },
    });
    return { deleted: result.count };
  }

  async getByTypeStats() {
    const stats = await this.prisma.notification.groupBy({
      by: ['type'],
      _count: { id: true },
    });
    return stats.map((s) => ({ type: s.type, count: s._count.id }));
  }

  async getReadStats() {
    const [total, unread] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
    ]);
    return { total, unread, readRate: total > 0 ? ((total - unread) / total * 100).toFixed(1) : '0' };
  }
}
