import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LicensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; entityId?: string }) {
    const where: Prisma.BizLicenseWhereInput = {};
    if (query.entityId) where.entityId = query.entityId;
    
    const [items, total] = await Promise.all([
      this.prisma.bizLicense.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 10),
        take: query.pageSize || 10,
        orderBy: { createdAt: 'desc' },
        include: { entity: true },
      }),
      this.prisma.bizLicense.count({ where }),
    ]);
    
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 10 };
  }

  async findOne(id: string) {
    return this.prisma.bizLicense.findUnique({
      where: { id },
      include: { entity: true },
    });
  }

  async create(data: Prisma.BizLicenseCreateInput) {
    return this.prisma.bizLicense.create({ data, include: { entity: true } });
  }

  async update(id: string, data: Prisma.BizLicenseUpdateInput) {
    return this.prisma.bizLicense.update({ where: { id }, data, include: { entity: true } });
  }

  async remove(id: string) {
    return this.prisma.bizLicense.delete({ where: { id } });
  }
}