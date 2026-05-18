import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEntityDto, UpdateEntityDto, CreateLicenseDto, UpdateLicenseDto, CreatePhotoDto } from './dto/entity.dto';

@Injectable()
export class EntitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20, filters?: { type?: string; streetId?: string; riskLevel?: string; status?: string; search?: string }) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.streetId) where.streetId = filters.streetId;
    if (filters?.riskLevel) where.riskLevel = filters.riskLevel;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) where.OR = [{ name: { contains: filters.search } }, { creditCode: { contains: filters.search } }];

    const [items, total] = await Promise.all([
      this.prisma.bizEntity.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, include: { street: true, licenses: true, qrCodeRecord: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.bizEntity.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const entity = await this.prisma.bizEntity.findUnique({
      where: { id },
      include: { street: true, licenses: true, photos: true, qrCodeRecord: true },
    });
    if (!entity) throw new NotFoundException('经营主体不存在');
    return entity;
  }

  async create(dto: CreateEntityDto, userId: string) {
    return this.prisma.bizEntity.create({ data: { ...dto, createdBy: userId } });
  }

  async update(id: string, dto: UpdateEntityDto) {
    await this.findOne(id);
    return this.prisma.bizEntity.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    // 先删除关联数据（避免外键约束失败）
    await Promise.all([
      this.prisma.infoCorrection.deleteMany({ where: { entityId: id } }),
      this.prisma.complaint.deleteMany({ where: { entityId: id } }),
      this.prisma.inspectionTask.deleteMany({ where: { entityId: id } }),
      this.prisma.selfInspection.deleteMany({ where: { entityId: id } }),
      this.prisma.entityPhoto.deleteMany({ where: { entityId: id } }),
      this.prisma.bizLicense.deleteMany({ where: { entityId: id } }),
    ]);
    return this.prisma.bizEntity.delete({ where: { id } });
  }

  // 批量删除
  async batchRemove(ids: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 验证所有实体存在
      const entities = await tx.bizEntity.findMany({ where: { id: { in: ids } } });
      if (entities.length !== ids.length) {
        throw new NotFoundException('部分经营主体不存在');
      }
      // 批量删除关联数据
      await Promise.all([
        tx.infoCorrection.deleteMany({ where: { entityId: { in: ids } } }),
        tx.complaint.deleteMany({ where: { entityId: { in: ids } } }),
        tx.inspectionTask.deleteMany({ where: { entityId: { in: ids } } }),
        tx.selfInspection.deleteMany({ where: { entityId: { in: ids } } }),
        tx.entityPhoto.deleteMany({ where: { entityId: { in: ids } } }),
        tx.bizLicense.deleteMany({ where: { entityId: { in: ids } } }),
        tx.qrScanRecord.deleteMany({ where: { entityId: { in: ids } } }),
        tx.rectification.deleteMany({ where: { entityId: { in: ids } } }),
      ]);
      // 批量删除主体
      const result = await tx.bizEntity.deleteMany({ where: { id: { in: ids } } });
      return { count: result.count, ids };
    });
  }

  // 许可备案
  async findLicenses(entityId: string) { return this.prisma.bizLicense.findMany({ where: { entityId } }); }
  async addLicense(entityId: string, dto: CreateLicenseDto) { return this.prisma.bizLicense.create({ data: { ...dto, entityId } }); }
  async updateLicense(id: string, dto: UpdateLicenseDto) { return this.prisma.bizLicense.update({ where: { id }, data: dto }); }
  async removeLicense(id: string) { return this.prisma.bizLicense.delete({ where: { id } }); }

  // 照片
  async findPhotos(entityId: string) { return this.prisma.entityPhoto.findMany({ where: { entityId } }); }
  async addPhoto(entityId: string, dto: CreatePhotoDto) { return this.prisma.entityPhoto.create({ data: { ...dto, entityId } }); }
  async addPhotos(entityId: string, photos: CreatePhotoDto[]) { return this.prisma.entityPhoto.createMany({ data: photos.map((p) => ({ ...p, entityId })) }); }
  async removePhoto(id: string) { return this.prisma.entityPhoto.delete({ where: { id } }); }

  // 统计
  async getStats() {
    const [total, active, byRisk, byType] = await Promise.all([
      this.prisma.bizEntity.count(),
      this.prisma.bizEntity.count({ where: { status: 'ACTIVE' } }),
      this.prisma.bizEntity.groupBy({ by: ['riskLevel'], _count: true }),
      this.prisma.bizEntity.groupBy({ by: ['type'], _count: true }),
    ]);
    return { total, active, byRisk, byType };
  }

  // 扫码搜索
  async searchByCode(code: string) {
    const entity = await this.prisma.bizEntity.findFirst({
      where: {
        OR: [
          { qrCode: code },
          { qrCodeRecord: { code } },
          { creditCode: code },
        ],
      },
      include: { street: true, licenses: true, qrCodeRecord: true, photos: { where: { category: 'STORE_SCENE' } } },
    });
    if (!entity) throw new NotFoundException('未找到对应经营主体');
    return entity;
  }

  // 公开信息
  async getPublicInfo(id: string) {
    const entity = await this.prisma.bizEntity.findUnique({
      where: { id },
      include: {
        licenses: true,
        photos: true,
        street: true,
        qrCodeRecord: true,
        inspectionRecords: {
          include: {
            inspector: { select: { id: true, realName: true } },
          },
          orderBy: { inspectedAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!entity) throw new NotFoundException();
    return entity;
  }
}
