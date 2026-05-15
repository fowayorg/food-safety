import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20, role?: string) {
    const where = role ? { role: role as any } : {};
    const [items, total] = await Promise.all([
      this.prisma.sysUser.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, username: true, realName: true, phone: true, role: true, status: true, createdAt: true } }),
      this.prisma.sysUser.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const user = await this.prisma.sysUser.findUnique({ where: { id }, select: { id: true, username: true, realName: true, phone: true, role: true, status: true, avatar: true, streetId: true, entityId: true, createdAt: true } });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.sysUser.create({ data: { ...dto, password: hashedPassword } });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.sysUser.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sysUser.delete({ where: { id } });
  }

  async batchRemove(ids: string[]) {
    const result = await this.prisma.sysUser.deleteMany({ where: { id: { in: ids } } });
    return { count: result.count, ids };
  }

  async findInspectors() {
    return this.prisma.sysUser.findMany({ where: { role: 'INSPECTOR', status: 'ACTIVE' }, select: { id: true, username: true, realName: true } });
  }

  async findScreeners() {
    return this.prisma.sysUser.findMany({ where: { role: 'SCREENER', status: 'ACTIVE' }, select: { id: true, username: true, realName: true } });
  }
}
