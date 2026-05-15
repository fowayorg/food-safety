import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateQrScanDto, QueryQrScansDto } from './dto/qr-scans.dto';

@Injectable()
export class QrScansService {
  constructor(private prisma: PrismaService) {}

  /**
   * 公开接口：扫码核销
   * 移动端/消费者扫码时调用，记录扫码行为并递增 scanCount
   */
  async scan(dto: CreateQrScanDto) {
    // 1. 通过 code 查找二维码
    const qrcode = await this.prisma.qRCode.findUnique({
      where: { code: dto.code },
      include: { entity: true },
    });

    if (!qrcode) {
      throw new NotFoundException('二维码不存在');
    }

    if (qrcode.status !== 'ACTIVE') {
      throw new BadRequestException('该二维码已停用');
    }

    // 2. 创建扫码记录
    const scanRecord = await this.prisma.qrScanRecord.create({
      data: {
        qrcodeId: qrcode.id,
        entityId: qrcode.entityId,
        scannerType: dto.scannerType || 'CONSUMER',
        scannerName: dto.scannerName || null,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        location: dto.location || null,
        action: dto.action || 'VIEW',
        remark: dto.remark || null,
      },
    });

    // 3. 递增 scanCount
    await this.prisma.qRCode.update({
      where: { id: qrcode.id },
      data: { scanCount: { increment: 1 } },
    });

    // 4. 返回结果（含主体信息）
    return {
      scanRecord,
      qrcode: {
        ...qrcode,
        scanCount: qrcode.scanCount + 1,
      },
      entity: qrcode.entity,
    };
  }

  /**
   * 管理端：查询扫码记录列表（分页+筛选）
   */
  async findAll(query: QueryQrScansDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.qrcodeId) where.qrcodeId = query.qrcodeId;
    if (query.entityId) where.entityId = query.entityId;
    if (query.scannerType) where.scannerType = query.scannerType;
    if (query.action) where.action = query.action;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [records, total] = await Promise.all([
      this.prisma.qrScanRecord.findMany({
        where,
        include: {
          qrcode: { select: { id: true, code: true, status: true } },
          entity: { select: { id: true, name: true, type: true, address: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.qrScanRecord.count({ where }),
    ]);

    return {
      items: records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 管理端：获取单条扫码记录详情
   */
  async findOne(id: string) {
    const record = await this.prisma.qrScanRecord.findUnique({
      where: { id },
      include: {
        qrcode: { include: { entity: true } },
        entity: true,
      },
    });
    if (!record) throw new NotFoundException(`扫码记录不存在`);
    return record;
  }

  /**
   * 统计：某二维码的扫码数据概览
   */
  async getStats(qrcodeId?: string, entityId?: string) {
    const where: any = {};
    if (qrcodeId) where.qrcodeId = qrcodeId;
    if (entityId) where.entityId = entityId;

    const [
      totalScans,
      viewCount,
      verifyCount,
      reportCount,
      byScannerType,
      recentScans,
    ] = await Promise.all([
      this.prisma.qrScanRecord.count({ where }),
      this.prisma.qrScanRecord.count({ where: { ...where, action: 'VIEW' } }),
      this.prisma.qrScanRecord.count({ where: { ...where, action: 'VERIFY' } }),
      this.prisma.qrScanRecord.count({ where: { ...where, action: 'REPORT' } }),
      this.prisma.qrScanRecord.groupBy({
        by: ['scannerType'],
        where,
        _count: true,
      }),
      this.prisma.qrScanRecord.findMany({
        where,
        include: {
          entity: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalScans,
      actionBreakdown: { view: viewCount, verify: verifyCount, report: reportCount },
      scannerTypeBreakdown: byScannerType.reduce((acc, item) => {
        acc[item.scannerType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentScans,
    };
  }
}
