import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    let lead;
    try {
      lead = await this.prisma.lead.create({
        data: { ...data, phone, tenantId: user.tenantId },
        include: { project: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Lead with this phone number already exists');
      }
      throw e;
    }
    
    // NEW_LEAD trigger: auto-assign agent (round-robin) + welcome email
    const assignedToId = await this.autoAssign(user.tenantId);
    if (assignedToId) {
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: { assignedToId },
      });
      await this.notificationsService.create({
        tenantId: user.tenantId,
        userId: assignedToId,
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${lead.name}`,
        type: 'NEW_LEAD',
        leadId: lead.id,
      });
    }

    if (lead.email && !lead.emailOptOut) {
      await this.emailQueue.add('send', {
        to: lead.email,
        subject: `Welcome to ${lead.project?.name || 'Waterting CRM'}`,
        html: `Hi ${lead.name}, thanks for your interest. Our representative will contact you soon.`,
      });
    }

    await this.aiScoringQueue.add('score-lead', { leadId: lead.id, tenantId: user.tenantId });
    return lead;
  }

  async findAll(user: JwtPayload, page = 1, limit = 50) {
    return this.prisma.lead.findMany({
      where: { tenantId: user.tenantId },
      take: limit,
      skip: (page - 1) * limit,
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

  async update(user: JwtPayload, id: string, data: any) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async assign(user: JwtPayload, id: string, userId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const agent = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: user.tenantId },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    return this.prisma.lead.update({
      where: { id },
      data: { assignedToId: userId },
    });
  }

  async addNote(user: JwtPayload, id: string, title: string, description: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.activity.create({
      data: {
        leadId: id,
        userId: user.sub,
        type: ActivityType.NOTE,
        title,
        description,
      },
    });
  }

  async addCall(user: JwtPayload, id: string, duration: string, outcome: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.activity.create({
      data: {
        leadId: id,
        userId: user.sub,
        type: ActivityType.CALL,
        title: `Call logged - ${outcome}`,
        description: `Duration: ${duration}. Outcome: ${outcome}`,
      },
    });
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
      case 'CONTACTED':
        // schedule 48h follow-up reminder
        // This is handled by StaleLeadWorker which monitors lastActivityAt
        break;

      case 'INTERESTED':
        // queue brochure email + add to nurture sequence
        if (lead.email && !lead.emailOptOut) {
          await this.emailQueue.add('send', {
            to: lead.email,
            subject: 'Project Brochure',
            html: `Hi ${lead.name}, please find the brochure attached.`,
          });
        }
        break;

      case 'VISIT_SCHEDULED':
        if (lead.email && !lead.emailOptOut) {
          await this.emailQueue.add('send', {
            to: lead.email,
            subject: 'Site Visit Scheduled',
            template: 'visit-confirmation',
            context: { name: lead.name, date: new Date().toLocaleDateString() },
          });
          // 24h reminder
          await this.emailQueue.add('send', {
            to: lead.email,
            subject: 'Reminder: Site Visit Tomorrow',
            html: `Hi ${lead.name}, your visit is scheduled for tomorrow.`,
          }, { delay: 24 * 3600000 });
          // 2h reminder
          await this.emailQueue.add('send', {
            to: lead.email,
            subject: 'Reminder: Site Visit in 2 Hours',
            html: `Hi ${lead.name}, your visit starts in 2 hours!`,
          }, { delay: 22 * 3600000 }); // Assuming scheduled in 24h
        }
        break;

      case 'VISIT_DONE':
        // queue post-visit nurture email (4h delay)
        if (lead.email && !lead.emailOptOut) {
          await this.emailQueue.add('send', {
            to: lead.email,
            subject: 'Thank you for visiting!',
            html: `Hi ${lead.name}, it was great meeting you today. Let us know if you have questions.`,
          }, { delay: 4 * 3600000 });
        }
        break;

      case 'NEGOTIATION':
        // notify all SalesManagers + TenantAdmin
        const admins = await this.prisma.user.findMany({
          where: { tenantId: user.tenantId, role: { in: ['TENANT_ADMIN', 'SALES_MANAGER'] } },
        });
        for (const admin of admins) {
          await this.notificationsService.create({
            tenantId: user.tenantId,
            userId: admin.id,
            title: `Negotiation Stage: ${lead.name}`,
            message: `${lead.assignedTo?.name || 'Agent'} moved ${lead.name} to Negotiation. Close it!`,
            type: 'NEGOTIATION',
            leadId: lead.id,
          });
        }
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

      case 'LOST':
        // queue re-engagement emails at 90/120/180 days
        if (lead.email && !lead.emailOptOut) {
          const delays = [90, 120, 180].map(d => d * 24 * 3600000);
          for (const d of delays) {
            await this.emailQueue.add('send', {
              to: lead.email,
              subject: 'Checking in',
              html: `Hi ${lead.name}, we haven't spoken in a while. Any updates on your home search?`,
            }, { delay: d });
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
