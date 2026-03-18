import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class AutomationsService {
  constructor(private prisma: PrismaService) {}

  async create(user: JwtPayload, data: any) {
    return this.prisma.automation.create({
      data: {
        ...data,
        tenantId: user.tenantId,
      },
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.automation.findMany({
      where: { tenantId: user.tenantId },
    });
  }

  async toggle(user: JwtPayload, id: string) {
    const automation = await this.prisma.automation.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!automation) throw new NotFoundException('Automation not found');

    return this.prisma.automation.update({
      where: { id },
      data: { isEnabled: !automation.isEnabled },
    });
  }
}
