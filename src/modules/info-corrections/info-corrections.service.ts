import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { 
  CreateInfoCorrectionDto, 
  UpdateInfoCorrectionDto, 
  ReviewInfoCorrectionDto,
  InfoCorrectionQueryDto
} from './dto/info-corrections.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class InfoCorrectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInfoCorrectionDto, userId?: string) {
    // Verify entity exists
    const entity = await this.prisma.bizEntity.findUnique({
      where: { id: dto.entityId },
    });
    if (!entity) {
      throw new BadRequestException('Entity not found');
    }

    // Determine submitter: if not logged in, try to find user by phone
    let submittedBy = userId || dto.submittedBy;
    
    if (!submittedBy && dto.submitterPhone) {
      const user = await this.prisma.sysUser.findFirst({
        where: { phone: dto.submitterPhone },
      });
      if (user) {
        submittedBy = user.id;
      }
    }

    // If still no userId, find or create public user
    if (!submittedBy) {
      let publicUser = await this.prisma.sysUser.findFirst({
        where: { username: 'public_user' },
      });
      if (!publicUser) {
        publicUser = await this.prisma.sysUser.create({
          data: {
            username: 'public_user',
            password: '$2a$10$placeholder/public/user/hash', // placeholder
            role: UserRole.CONSUMER,
            status: 'ACTIVE',
          },
        });
      }
      submittedBy = publicUser.id;
    }

    return this.prisma.infoCorrection.create({
      data: {
        entityId: dto.entityId,
        submittedBy: submittedBy,
        field: dto.fieldName || 'other',
        oldValue: dto.oldValue,
        newValue: dto.newValue,
        evidence: dto.evidence,
        reason: dto.reason,
        status: 'PENDING',
      },
      include: { entity: true },
    });
  }

  async findAll(query: InfoCorrectionQueryDto) {
    const { page = 1, pageSize = 10, status, entityId, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};
    if (status) where.status = status;
    if (entityId) where.entityId = entityId;

    const [items, total] = await Promise.all([
      this.prisma.infoCorrection.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: { 
          entity: {
            select: { id: true, name: true, creditCode: true }
          }
        },
      }),
      this.prisma.infoCorrection.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const correction = await this.prisma.infoCorrection.findUnique({
      where: { id },
      include: { 
        entity: {
          select: { id: true, name: true, creditCode: true, address: true }
        }
      },
    });
    if (!correction) throw new NotFoundException('InfoCorrection not found');
    return correction;
  }

  async update(id: string, dto: UpdateInfoCorrectionDto) {
    const existing = await this.prisma.infoCorrection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('InfoCorrection not found');
    
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Can only update pending corrections');
    }

    return this.prisma.infoCorrection.update({
      where: { id },
      data: {
        field: dto.fieldName,
        oldValue: dto.oldValue,
        newValue: dto.newValue,
        evidence: dto.evidence,
        reason: dto.reason,
      },
      include: { entity: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.infoCorrection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('InfoCorrection not found');
    
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Can only delete pending corrections');
    }

    return this.prisma.infoCorrection.delete({
      where: { id },
    });
  }

  async review(id: string, dto: ReviewInfoCorrectionDto, reviewerId: string) {
    const correction = await this.findOne(id);
    
    if (correction.status !== 'PENDING') {
      throw new BadRequestException('Can only review pending corrections');
    }

    const updated = await this.prisma.infoCorrection.update({
      where: { id },
      data: {
        status: dto.status,
        reviewRemark: dto.reviewRemark,
        reviewerId,
        reviewedAt: new Date(),
      },
      include: { entity: true },
    });

    // If approved, update entity info
    if (dto.status === 'APPROVED') {
      const fieldMap: Record<string, string> = {
        name: 'name',
        address: 'address',
        phone: 'phone',
        legalPerson: 'legalPerson',
        businessScope: 'businessScope',
        licenseNo: 'licenseNo',
        safetyDirector: 'safetyDirector',
        safetyOfficer: 'safetyOfficer',
        guaranteeCadre: 'guaranteeCadre',
        guaranteeCadreTitle: 'guaranteeCadreTitle',
        other: 'name',
      };
      
      const dbField = fieldMap[correction.field] || correction.field;
      if (dbField && correction.newValue) {
        await this.prisma.bizEntity.update({
          where: { id: correction.entityId },
          data: { [dbField]: correction.newValue },
        });
      }
      // Notify entity operators about approved correction
      const operators = await this.prisma.sysUser.findMany({
        where: { role: 'OPERATOR' as any, status: 'ACTIVE' },
        select: { id: true },
      });
      for (const op of operators) {
        await this.prisma.notification.create({
          data: {
            userId: op.id,
            title: '信息更正已通过',
            content: `您提交的「${correction.field}」字段更正申请已通过审核。`,
            type: 'SYSTEM' as any,
            relatedId: correction.entityId,
            relatedType: 'BizEntity',
          },
        });
      }
    }

    return updated;
  }

  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.infoCorrection.count(),
      this.prisma.infoCorrection.count({ where: { status: 'PENDING' } }),
      this.prisma.infoCorrection.count({ where: { status: 'APPROVED' } }),
      this.prisma.infoCorrection.count({ where: { status: 'REJECTED' } }),
    ]);

    return { total, pending, approved, rejected };
  }

  async findByPhone(phone: string) {
    const user = await this.prisma.sysUser.findFirst({
      where: { phone },
    });
    
    if (!user) {
      return [];
    }

    return this.prisma.infoCorrection.findMany({
      where: { submittedBy: user.id },
      orderBy: { createdAt: 'desc' },
      include: { entity: { select: { id: true, name: true } } },
    });
  }
}