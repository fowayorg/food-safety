import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInspectionTemplateDto, UpdateInspectionTemplateDto } from './dto/inspection-templates.dto';
import { InspectionType } from '@prisma/client';

@Injectable()
export class InspectionTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInspectionTemplateDto, userId: string) {
    return this.prisma.inspectionTemplate.create({
      data: {
        name: dto.name,
        type: dto.type,
        createdBy: userId,
        items: dto.items
          ? {
              create: dto.items.map((item) => ({
                name: item.name,
                required: item.required,
                type: item.type,
              })),
            }
          : undefined,
      },
      include: { items: true, creator: true },
    });
  }

  async findAll() {
    return this.prisma.inspectionTemplate.findMany({
      include: { items: true, creator: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.inspectionTemplate.findUnique({
      where: { id },
      include: { items: true, creator: true },
    });
    if (!template) throw new NotFoundException(`InspectionTemplate with ID ${id} not found`);
    return template;
  }

  async update(id: string, dto: UpdateInspectionTemplateDto) {
    await this.findOne(id);
    return this.prisma.inspectionTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        items: dto.items
          ? {
              deleteMany: {},
              create: dto.items.map((item) => ({
                id: item.id, // if provided, update existing
                name: item.name,
                required: item.required,
                type: item.type,
              })),
            }
          : undefined,
      },
      include: { items: true, creator: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inspectionTemplate.delete({
      where: { id },
    });
  }
}
