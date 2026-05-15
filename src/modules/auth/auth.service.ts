import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.sysUser.findUnique({
      where: { username: dto.username },
    });
    if (!user) throw new UnauthorizedException('用户名或密码错误');
    if (user.status === 'DISABLED') throw new UnauthorizedException('用户已禁用');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('用户名或密码错误');

    const token = await this.generateToken(user.id, user.role);
    return { token, user: { id: user.id, username: user.username, realName: user.realName, role: user.role } };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.sysUser.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new UnauthorizedException('用户名已存在');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.sysUser.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        phone: dto.phone,
        realName: dto.realName,
        role: 'CONSUMER',
      },
    });

    const token = await this.generateToken(user.id, user.role);
    return { token, user: { id: user.id, username: user.username, realName: user.realName, role: user.role } };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
      select: { id: true, username: true, realName: true, phone: true, role: true, avatar: true, streetId: true, entityId: true },
    });
    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }

  private async generateToken(userId: string, role: string) {
    return this.jwtService.signAsync({ sub: userId, role });
  }
}
