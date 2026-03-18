import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: JwtPayload) {
    // Tenant middleware theoretically applies, but let's be safe
    return this.prisma.user.findMany({
      where: { tenantId: user.tenantId },
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, agentCode: true },
    });
  }

  async create(user: JwtPayload, data: any) {
    const existing = await this.prisma.user.findFirst({
      where: { email: data.email, tenantId: user.tenantId },
    });
    if (existing) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId: user.tenantId,
      },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async remove(user: JwtPayload, id: string) {
    return this.prisma.user.update({
      where: { id_tenantId: { id, tenantId: user.tenantId } } as any,
      data: { isActive: false },
    }).catch(() => {
       return this.prisma.user.update({
         where: { id },
         data: { isActive: false },
       });
    });
  }
}
