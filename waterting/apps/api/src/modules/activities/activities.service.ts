import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findByLead(user: JwtPayload, leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.activity.findMany({
      where: { leadId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(user: JwtPayload, leadId: string, data: any) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.activity.create({
      data: {
        ...data,
        tenantId: user.tenantId,
        leadId,
        userId: user.sub,
      },
    });
  }
}
