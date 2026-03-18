import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, LeadSource, ActivityType } from '@waterting/shared';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  // Helper: Format phone to E.164 conceptually
  private normalizePhone(phone: string) {
    return phone.replace(/\D/g, ''); // Naive implementation, assumes 10-12 digits pure
  }

  async create(user: JwtPayload, data: any) {
    const phone = this.normalizePhone(data.phone);
    const existing = await this.prisma.lead.findFirst({
      where: {
        tenantId: user.tenantId,
        phone,
      },
    });

    if (existing) {
      // Merge: Update source to track it hit multiple times
      await this.prisma.activity.create({
        data: {
          leadId: existing.id,
          userId: user.sub,
          type: ActivityType.NOTE,
          title: 'Duplicate lead attempt spotted',
          description: `Attempted source: ${data.source}. Did not duplicate.`,
        },
      });
      return existing;
    }

    return this.prisma.lead.create({
      data: {
        ...data,
        phone,
        tenantId: user.tenantId,
      },
      include: { project: true },
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.lead.findMany({
      where: { tenantId: user.tenantId },
      include: {
        project: true,
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
         project: true,
         activities: { orderBy: { createdAt: 'desc' } },
         siteVisits: true,
         bookings: true,
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateStage(user: JwtPayload, id: string, stage: string) {
    const lead = await this.prisma.lead.updateMany({
      where: { id, tenantId: user.tenantId },
      data: { stage: stage as any },
    });
    
    // Log activity
    await this.prisma.activity.create({
      data: {
        leadId: id,
        userId: user.sub,
        type: ActivityType.STAGE_CHANGE,
        title: `Stage changed to ${stage}`,
      },
    });

    return lead;
  }
}
