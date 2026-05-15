import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateQrcodeDto, UpdateQrcodeDto, VerifyQrcodeDto } from './dto/qrcodes.dto';

@Injectable()
export class QrcodesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQrcodeDto) {
    // Generate a unique code (simple random string)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const imageUrl = `https://foodsatety.example.com/qr/${code}`; // TODO: configure base URL
    return this.prisma.qRCode.create({
      data: {
        entityId: dto.entityId,
        code,
        imageUrl,
      },
      include: { entity: true },
    });
  }

  async findAll() {
    return this.prisma.qRCode.findMany({
      include: { entity: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const qrcode = await this.prisma.qRCode.findUnique({
      where: { id },
      include: { entity: true },
    });
    if (!qrcode) throw new NotFoundException(`QRCode with ID ${id} not found`);
    return qrcode;
  }

  async update(id: string, dto: UpdateQrcodeDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.entityId) data.entityId = dto.entityId;
    if (dto.code) {
      data.code = dto.code;
      data.imageUrl = `https://foodsatety.example.com/qr/${dto.code}`;
    }
    return this.prisma.qRCode.update({
      where: { id },
      data,
      include: { entity: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.qRCode.delete({
      where: { id },
    });
  }

  /**
   * 核销核验：对二维码执行核销操作，创建一条 VERIFY 类型的扫码记录
   * 同时更新二维码的 scanCount
   */
  async verify(id: string, dto: VerifyQrcodeDto, operatorId?: string, operatorName?: string) {
    const qrcode = await this.findOne(id);
    if (qrcode.status !== 'ACTIVE') {
      throw new BadRequestException('该二维码已停用，无法核销');
    }

    // 创建核销记录
    const record = await this.prisma.qrScanRecord.create({
      data: {
        qrcodeId: id,
        entityId: qrcode.entityId,
        scannerType: 'INSPECTOR',
        scannerId: operatorId,
        scannerName: operatorName || '管理员',
        action: 'VERIFY',
        remark: dto.remark || '',
        location: dto.location || '',
      },
      include: { qrcode: true, entity: true },
    });

    // 更新二维码扫码次数
    await this.prisma.qRCode.update({
      where: { id },
      data: { scanCount: { increment: 1 } },
    });

    return record;
  }
}
