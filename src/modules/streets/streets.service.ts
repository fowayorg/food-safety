import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStreetDto, UpdateStreetDto } from './dto/street.dto';

@Injectable()
export class StreetsService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.street.findMany({ orderBy: { createdAt: 'desc' } }); }
  async findOne(id: string) { const r = await this.prisma.street.findUnique({ where: { id } }); if (!r) throw new NotFoundException(); return r; }
  create(dto: CreateStreetDto) { return this.prisma.street.create({ data: dto }); }
  update(id: string, dto: UpdateStreetDto) { return this.prisma.street.update({ where: { id }, data: dto }); }
  remove(id: string) { return this.prisma.street.delete({ where: { id } }); }
}
