import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class StaleLeadWorker {
  private readonly logger = new Logger(StaleLeadWorker.name);

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway
  ) {}

  @Cron('0 9 * * *') // 9 AM Daily
  async checkStaleLeads() {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const staleLeads = await this.prisma.lead.findMany({
      where: {
        stage: { notIn: ['BOOKING_DONE', 'LOST'] },
        lastActivityAt: { lt: fiveDaysAgo },
      },
      include: { assignedTo: true },
    });

    this.logger.log(`Found ${staleLeads.length} stale leads.`);

    for (const lead of staleLeads) {
      const lastActivity = lead.lastActivityAt || lead.createdAt;
      const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / 86400000);
      
      // Log activity
      await this.prisma.activity.create({
        data: {
          leadId: lead.id,
          type: 'AI_ACTION' as any,
          title: 'Stale Lead Alert',
          description: `No activity for ${daysSince} days. Flagged for immediate follow-up.`,
        },
      });

      // Emit real-time notification
      this.events.emitToTenant(lead.tenantId, 'lead:stale', {
        leadId: lead.id,
        name: lead.name,
        daysSince,
      });

      this.logger.warn(`Stale Lead Alert: ${lead.name} (${daysSince} days)`);
    }
  }
}
