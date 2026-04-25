import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, LeadSource, ActivityType, UserRole } from '@waterting/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { AIService } from '../../common/ai/ai.service';
import { CommunicationService } from '../../common/comm/communication.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private gateway: EventsGateway,
    private notificationsService: NotificationsService,
    private aiService: AIService,
    private comm: CommunicationService,
    @InjectQueue('ai-scoring') private aiScoringQueue: Queue,
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('pdf') private pdfQueue: Queue,
  ) {}

  async createFromWebhook(data: any) {
    const tenantId = data.tenantId;
    const phone = this.normalizePhone(String(data.phone || ''));
    
    // 1. Check for duplicates (Phone or Email)
    const existing = await this.prisma.lead.findFirst({
      where: {
        tenantId,
        OR: [
          { phone },
          { email: data.email ? String(data.email) : undefined },
        ].filter(Boolean) as Prisma.LeadWhereInput[]
      }
    });

    if (existing) {
      // Log interaction but don't double count
      await this.prisma.activity.create({
        data: {
          leadId: existing.id,
          type: ActivityType.NOTE,
          title: `Duplicate lead inquiry received from ${data.source || 'Webhook'}`,
        }
      });
      return existing;
    }

    // AI Semantic Check
    const embedding = await this.aiService.generateEmbedding(`${data.name} ${data.email || ''} ${data.phone}`);
    const matches = await this.aiService.queryVector(tenantId, embedding, 1);
    
    if (matches.length > 0 && matches[0].distance < 0.1) {
       // Flag as potential duplicate
       // We can still create it but mark it for merge or just return existing
       if (matches[0].leadId) {
         return this.prisma.lead.findUnique({ where: { id: matches[0].leadId } });
       }
    }

    // 2. Auto-allocation (Multi-party)
    const assignedToId = await this.autoAssignAgent(tenantId);
    let brokerId = data.brokerId;
    if (!brokerId && (data.source === LeadSource.BROKER || data.referralCode)) {
      brokerId = await this.autoAssignBroker(tenantId, data.referralCode);
    }

    // 3. Create
    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        phone,
        assignedToId,
        brokerId,
        lastActivityAt: new Date(),
      },
      include: { project: true }
    });

    // 4. Notify Builder / Management
    const builders = await this.prisma.user.findMany({
      where: { 
        tenantId, 
        role: { in: [UserRole.TENANT_ADMIN, UserRole.AGENCY_OWNER] },
        isActive: true
      },
      take: 50,
      skip: 0,
      select: { id: true }
    });

    for (const builder of builders) {
      await this.notificationsService.create({
        tenantId,
        userId: builder.id,
        title: `🔥 New Hot Lead: ${lead.name}`,
        message: `A new inquiry for ${lead.project?.name || 'your project'} has been assigned to ${assignedToId ? 'Sales Agent' : 'Waiting Area'}.`,
        type: 'NEW_LEAD',
        leadId: lead.id,
      });
    }

    // 5. Trigger AI Scoring
    await this.aiScoringQueue.add('score-lead', {
      leadId: lead.id,
      tenantId,
    });

    return lead;
  }

  private async autoAssignBroker(tenantId: string, referralCode?: string): Promise<string | null> {
    if (referralCode) {
      const broker = await this.prisma.broker.findUnique({ where: { referralCode } });
      if (broker && broker.tenantId === tenantId) return broker.id;
    }
    
    // Weighted Round-robin: Pick broker with least active leads
    const brokers = await this.prisma.broker.findMany({
      where: { tenantId, isActive: true },
      take: 50,
      skip: 0,
      select: {
        id: true,
        _count: {
          select: { leads: { where: { stage: { notIn: ['BOOKING_DONE', 'LOST'] } } } }
        }
      }
    });

    if (brokers.length === 0) return null;
    return brokers.sort((a, b) => a._count.leads - b._count.leads)[0].id;
  }

  private async autoAssignAgent(tenantId: string): Promise<string | null> {
    // Round-robin among SALES_AGENTs
    const agents = await this.prisma.user.findMany({
      where: { tenantId, role: UserRole.SALES_AGENT, isActive: true },
      take: 50,
      skip: 0,
      select: {
        id: true,
        _count: {
          select: { leads: { where: { stage: { notIn: ['BOOKING_DONE', 'LOST'] } } } }
        }
      }
    });

    if (agents.length === 0) return null;
    return (agents as any[]).sort((a, b) => a._count.leads - b._count.leads)[0].id;
  }

  private normalizePhone(phone: string) {
    return phone.replace(/\D/g, '');
  }

  async create(user: JwtPayload, dto: any) {
    try {
      // 1. Check for duplicates
      const phone = this.normalizePhone(String(dto.phone || ''));
      const existing = await this.prisma.lead.findFirst({
        where: {
          tenantId: user.tenantId,
          OR: [
            { phone },
            { email: dto.email ? String(dto.email) : undefined },
          ].filter(Boolean) as Prisma.LeadWhereInput[]
        }
      });

      if (existing) {
        throw new ConflictException(
          `A lead with this ${existing.phone === phone ? 'phone number' : 'email'} already exists.`
        );
      }

      // Auto-assign agent if none specified
      if (!dto.assignedToId) {
        dto.assignedToId = await this.autoAssignAgent(user.tenantId);
      }

      const lead = await this.prisma.lead.create({
        data: {
          ...dto,
          tenantId: user.tenantId,
          lastActivityAt: new Date(),
        },
      });
      // Queue AI scoring job after creation
      await this.aiScoringQueue.add('score-lead', {
        leadId: lead.id,
        tenantId: user.tenantId,
      });
      return lead;
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException(
          'A lead with this phone number already exists. Check the existing lead or use a different number.'
        );
      }
      throw e;
    }
  }


  async findAll(user: JwtPayload, page = 1, limit = 50) {
    return this.prisma.lead.findMany({
      where: { tenantId: user.tenantId },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        stage: true,
        scoreLabel: true,
        score: true,
        source: true,
        createdAt: true,
        assignedToId: true,
        assignedTo: { select: { id: true, name: true } },
        project: { select: { name: true } },
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

  async parseWhatsAppLead(user: JwtPayload, text: string) {
    const prompt = `
      You are a Real Estate Assistant. Extract lead information from this WhatsApp message snippet:
      "${text}"

      Identify:
      - Full name
      - Phone number (clean it to digits only)
      - Email (if any)
      - Project Interested in (if mentioned)
      - Notes / Requirements

      Return JSON format:
      {
        "name": "string",
        "phone": "string",
        "email": "string | null",
        "projectInterest": "string | null",
        "notes": "string"
      }
    `;

    const parsed = await this.aiService.generateJSON<any>(prompt);
    
    // We try to find project by name if extracted
    let projectId: string | undefined;
    if (parsed.projectInterest) {
      const project = await this.prisma.project.findFirst({
        where: { name: { contains: parsed.projectInterest, mode: 'insensitive' }, tenantId: user.tenantId }
      });
      if (project) projectId = project.id;
    }

    return this.create(user, {
      name: parsed.name || 'WhatsApp Lead',
      phone: parsed.phone,
      email: parsed.email || undefined,
      projectId,
      notes: parsed.notes,
      source: LeadSource.WHATSAPP,
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

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.lead.update({
        where: { id },
        data: { stage: stage as any },
      });

      await tx.activity.create({
        data: {
          leadId: id,
          userId: user.sub,
          type: ActivityType.STAGE_CHANGE,
          title: `Stage changed to ${stage}`,
        },
      });

      return res;
    });

    this.gateway.emitToTenant(user.tenantId, 'lead:updated', { leadId: id, stage });
    await this.handleStageTrigger(user, updated, stage);
    return updated;
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
          take: 50,
          skip: 0,
          select: { id: true }
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
            take: 50,
            skip: 0,
            select: { id: true }
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

  async claim(user: JwtPayload, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.assignedToId) throw new BadRequestException('Lead already claimed by another agent');

    const updated = await this.prisma.lead.update({
      where: { id },
      data: { assignedToId: user.sub },
    });

    // Notify lead via WhatsApp with Agent Bio (placeholder)
    if (updated.phone) {
       await this.comm.sendWhatsApp(
         updated.phone,
         `Hello ${updated.name}, I'm ${(user as any).name || 'your agent'} from Waterting. I'll be assisting you with your home search today!`
       );
    }

    return updated;
  }


}
