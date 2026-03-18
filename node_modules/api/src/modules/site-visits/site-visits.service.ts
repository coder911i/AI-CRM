import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, VisitOutcome, ActivityType } from '@waterting/shared';

@Injectable()
export class SiteVisitsService {
  constructor(private prisma: PrismaService) {}

  async schedule(user: JwtPayload, data: any) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: data.leadId, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const visit = await this.prisma.siteVisit.create({
      data: {
        ...data,
      },
    });

    await this.prisma.activity.create({
      data: {
        leadId: data.leadId,
        userId: user.sub,
        type: ActivityType.VISIT_SCHEDULED,
        title: 'Site Visit Scheduled',
        metadata: { scheduledAt: data.scheduledAt },
      },
    });

    return visit;
  }

  async recordOutcome(user: JwtPayload, id: string, outcome: VisitOutcome, notes?: string) {
    const visit = await this.prisma.siteVisit.findUnique({
      where: { id },
      include: { lead: true },
    });
    if (!visit || visit.lead.tenantId !== user.tenantId) {
      throw new NotFoundException('Site Visit not found');
    }

    const updated = await this.prisma.siteVisit.update({
      where: { id },
      data: { outcome, notes },
    });

    await this.prisma.activity.create({
      data: {
        leadId: visit.lead.id,
        userId: user.sub,
        type: ActivityType.VISIT_COMPLETED,
        title: `Site Visit Completed: ${outcome}`,
        description: notes,
      },
    });

    return updated;
  }

  async findAll(user: JwtPayload) {
    return this.prisma.siteVisit.findMany({
      where: { lead: { tenantId: user.tenantId } },
      include: { lead: true, agent: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
