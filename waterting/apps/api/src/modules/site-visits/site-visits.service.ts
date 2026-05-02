import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, VisitOutcome, ActivityType } from '@waterting/shared';
import { SiteVisit } from '@prisma/client';
import { CommunicationService } from '../../common/comm/communication.service';

@Injectable()
export class SiteVisitsService {
  constructor(
    private prisma: PrismaService,
    private comm: CommunicationService,
  ) {}

  async schedule(user: JwtPayload, data: any) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: data.leadId, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const visit = await this.prisma.siteVisit.create({
      data: {
        ...data,
        verificationToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      },
    });

    await this.prisma.activity.create({
      data: {
        tenantId: user.tenantId,
        leadId: data.leadId,
        userId: user.sub,
        type: ActivityType.VISIT_SCHEDULED,
        title: 'Site Visit Scheduled',
        metadata: { scheduledAt: data.scheduledAt },
      },
    });

    return visit;
  }

  async checkIn(user: JwtPayload, id: string) {
    const visit = await this.prisma.siteVisit.findFirst({
      where: { id, lead: { tenantId: user.tenantId } },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.checkInTime) throw new BadRequestException('Already checked in');

    return this.prisma.siteVisit.update({
      where: { id },
      data: { checkInTime: new Date() },
    });
  }

  async qrCheckIn(token: string, lat?: number, lng?: number) {
    const visit = await this.prisma.siteVisit.findFirst({
      where: { verificationToken: token },
      include: { lead: true, agent: true }
    });
    if (!visit) throw new NotFoundException('Invalid or expired QR code');
    if (visit.checkInTime) return visit;

    const updated = await this.prisma.siteVisit.update({
      where: { id: visit.id },
      data: { 
        checkInTime: new Date(),
        metadata: { ...(visit.metadata as any || {}), checkInGps: { lat, lng } }
      },
      include: { lead: true }
    });

    // Send WhatsApp confirmation
    if (updated.lead.phone) {
      this.comm.sendWhatsApp(
        updated.lead.phone, 
        `Hello ${updated.lead.name}, welcome to your site visit! Your check-in has been recorded at ${new Date().toLocaleTimeString()}.`
      );
    }

    return updated;
  }

  async checkOut(user: JwtPayload, id: string, dto: { outcome: VisitOutcome; notes: string; followUpDate?: string; rating?: number }) {
    const visit = await this.prisma.siteVisit.findFirst({
      where: { id, lead: { tenantId: user.tenantId } },
      include: { lead: true },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    if (!visit.checkInTime) throw new BadRequestException('Must check in before checking out');

    // Update visit
    const updated = await this.prisma.siteVisit.update({
      where: { id },
      data: {
        outcome: dto.outcome,
        notes: dto.notes,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        checkOutTime: new Date(),
      },
    });

    // Auto-stage lead
    const stageMap: Record<string, string> = {
      BOOKED: 'BOOKING_DONE',
      INTERESTED: 'NEGOTIATION',
      NEED_MORE_TIME: 'VISIT_DONE',
      NO_SHOW: 'CONTACTED',
    };
    const newStage = stageMap[dto.outcome];
    if (newStage) {
      await this.prisma.lead.update({
        where: { id: visit.leadId },
        data: { stage: newStage as any, lastActivityAt: new Date() },
      });
    }

    // Log activity
    await this.prisma.activity.create({
      data: {
        tenantId: user.tenantId,
        leadId: visit.leadId,
        userId: user.sub,
        type: ActivityType.VISIT_COMPLETED,
        title: `Site Visit Completed — ${dto.outcome}`,
        description: dto.notes,
        metadata: { outcome: dto.outcome, followUpDate: dto.followUpDate, rating: dto.rating },
      },
    });

    return updated;
  }

  async recordOutcome(user: JwtPayload, id: string, data: { outcome: VisitOutcome; notes?: string; followUpDate?: Date }) {
    // Legacy support for manual outcome recording
    return this.checkOut(user, id, { ...data, followUpDate: data.followUpDate?.toISOString() } as any);
  }

  async findAll(user: JwtPayload) {
    return this.prisma.siteVisit.findMany({
      where: { lead: { tenantId: user.tenantId } },
      include: { lead: true, agent: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
