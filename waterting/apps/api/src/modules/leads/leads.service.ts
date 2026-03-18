import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, LeadSource, ActivityType } from '@waterting/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private gateway: EventsGateway,
    private notificationsService: NotificationsService,
    @InjectQueue('ai-scoring') private aiScoringQueue: Queue,
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('pdf') private pdfQueue: Queue,
  ) {}

  private normalizePhone(phone: string) {
    return phone.replace(/\D/g, '');
  }

  async create(user: JwtPayload, data: any) {
    const phone = this.normalizePhone(data.phone);
    const existing = await this.prisma.lead.findFirst({
      where: { tenantId: user.tenantId, phone },
    });
    if (existing) {
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
    const lead = await this.prisma.lead.create({
      data: { ...data, phone, tenantId: user.tenantId },
      include: { project: true },
    });
    await this.aiScoringQueue.add('score-lead', { leadId: lead.id, tenantId: user.tenantId });
    return lead;
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
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    await this.prisma.lead.update({
      where: { id },
      data: { stage: stage as any },
    });
    await this.prisma.activity.create({
      data: {
        leadId: id,
        userId: user.sub,
        type: ActivityType.STAGE_CHANGE,
        title: `Stage changed to ${stage}`,
      },
    });
    this.gateway.emitToTenant(user.tenantId, 'lead:updated', { leadId: id, stage });
    await this.handleStageTrigger(user, lead, stage);
    return lead;
  }

  private async handleStageTrigger(user: JwtPayload, lead: any, stage: string) {
    switch (stage) {
      case 'VISIT_SCHEDULED':
        await this.emailQueue.add('send', {
          to: lead.email,
          subject: 'Site Visit Scheduled',
          template: 'visit-confirmation',
          context: { name: lead.name, date: new Date().toLocaleDateString() },
        });
        break;
      case 'BOOKING_DONE':
        const booking = await this.prisma.booking.findFirst({
          where: { leadId: lead.id },
          orderBy: { createdAt: 'desc' },
          include: { unit: { include: { tower: { include: { project: true } } } } },
        });
        if (booking) {
          await this.pdfQueue.add('booking-confirmation', { bookingId: booking.id });
          if (booking.buyerEmail) {
            await this.emailQueue.add('send', {
              to: booking.buyerEmail,
              subject: `Booking Confirmed — ${booking.unit.tower.project.name} Unit ${booking.unit.unitNumber}`,
              html: `<h2>Congratulations ${booking.buyerName}!</h2><p>Your booking for Unit ${booking.unit.unitNumber} at ${booking.unit.tower.project.name} is confirmed.</p><p><a href="${process.env.FRONTEND_URL}/portal/login">View your booking in the client portal →</a></p>`,
            });
          }
          const accounts = await this.prisma.user.findMany({
            where: { tenantId: user.tenantId, role: 'ACCOUNTS' as any },
          });
          for (const acc of accounts) {
            await this.notificationsService.create({
              tenantId: user.tenantId,
              userId: acc.id,
              title: `New Booking: ${booking.buyerName}`,
              message: `Unit ${booking.unit.unitNumber} — ₹${booking.bookingAmount.toLocaleString('en-IN')} — document collection needed in 48h`,
              type: 'BOOKING',
              leadId: lead.id,
            });
          }
        }
        break;
    }
  }

  async autoAssign(tenantId: string): Promise<string | null> {
    const agents = await this.prisma.user.findMany({
      where: { tenantId, role: 'SALES_AGENT', isActive: true },
      include: { _count: { select: { leads: true } } },
      orderBy: { leads: { _count: 'asc' } },
    });
    return agents[0]?.id ?? null;
  }

  async createFromWebhook(data: any) {
    const tenantId = data.tenantId || (await this.prisma.tenant.findFirst())?.id;
    if (!tenantId) throw new Error('No tenant context found for webhook');
    
    const phone = this.normalizePhone(data.phone);
    const existing = await this.prisma.lead.findFirst({
      where: { tenantId, phone },
    });
    if (existing) return existing;

    const lead = await this.prisma.lead.create({
      data: { 
        name: data.name,
        phone,
        email: data.email,
        source: data.source || LeadSource.WEBSITE,
        tenantId,
      },
    });
    await this.aiScoringQueue.add('score-lead', { leadId: lead.id, tenantId });
    return lead;
  }
}
