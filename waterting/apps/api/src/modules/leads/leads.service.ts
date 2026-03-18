import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, LeadSource, ActivityType } from '@waterting/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private gateway: EventsGateway,
    @InjectQueue('ai-scoring') private aiScoringQueue: Queue,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

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

    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        phone,
        tenantId: user.tenantId,
      },
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
    
    // Log activity
    await this.prisma.activity.create({
      data: {
        leadId: id,
        userId: user.sub,
        type: ActivityType.STAGE_CHANGE,
        title: `Stage changed to ${stage}`,
      },
    });

    // Emit WebSocket event
    this.gateway.emitToTenant(user.tenantId, 'lead:updated', { leadId: id, stage });

    // Handle triggers
    if (stage === 'VISIT_SCHEDULED') {
      await this.emailQueue.add('send', {
        to: lead.email,
        subject: 'Site Visit Scheduled',
        template: 'visit-confirmation',
        context: { name: lead.name, date: new Date().toLocaleDateString() },
      });
    }

    return lead;
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
    const tenant = await this.prisma.tenant.findFirst();
    if (!tenant) throw new Error('No default tenant found for webhook');
    const phone = this.normalizePhone(data.phone);
    const existing = await this.prisma.lead.findFirst({
      where: { tenantId: tenant.id, phone },
    });
    if (existing) return existing;
    const lead = await this.prisma.lead.create({
      data: { ...data, phone, tenantId: tenant.id },
    });
    await this.aiScoringQueue.add('score-lead', { leadId: lead.id, tenantId: tenant.id });
    return lead;
  }
}
