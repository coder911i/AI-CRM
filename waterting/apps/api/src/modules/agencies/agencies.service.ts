import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AgenciesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.agency.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.agency.findMany({
      where: { tenantId },
      include: { _count: { select: { members: true } } },
    });
  }

  async getAgencyTeam(agencyId: string) {
    return this.prisma.user.findMany({
      where: { agencyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        leads: { select: { id: true, stage: true } },
      },
    });
  }
}
