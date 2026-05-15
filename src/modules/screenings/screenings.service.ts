import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateScreeningRecordDto, UpdateScreeningRecordDto } from './dto/screenings.dto';

@Injectable()
export class ScreeningsService {
  constructor(private readonly prisma: PrismaService) {}

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
    // Auto-update entity risk level from screening result
    if (dto.riskLevel) {
      await this.prisma.bizEntity.update({
        where: { id: dto.entityId },
        data: {
          riskLevel: dto.riskLevel as any,
          riskRatedAt: new Date(),
        },
      });
    }
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
    // Auto-update entity risk level from screening result
    if (dto.riskLevel) {
      await this.prisma.bizEntity.update({
        where: { id: existing.entityId },
        data: {
          riskLevel: dto.riskLevel as any,
          riskRatedAt: new Date(),
        },
      });
    }
    return record;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.screeningRecord.delete({ where: { id } });
  }
}
