import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../gateways/events.gateway';
import { AIService } from '../common/ai/ai.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class StaleLeadWorker {
  private readonly logger = new Logger(StaleLeadWorker.name);

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
    private ai: AIService,
  ) {}

  @Cron('0 9 * * *') // 9 AM Daily
  async checkStaleLeads() {
    try {
      this.logger.log('Checking for stale leads...');
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      const staleLeads = await this.prisma.lead.findMany({
        where: {
          stage: { notIn: ['BOOKING_DONE', 'LOST'] },
          lastActivityAt: { lt: fiveDaysAgo },
        },
        include: { assignedTo: true },
      });

      this.logger.log(`Found ${staleLeads.length} stale leads.`);
      let processed = 0;

      for (const lead of staleLeads) {
        try {
          const lastActivity = lead.lastActivityAt || lead.createdAt;
          const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / 86400000);
          
          // Generate re-engagement text via Groq
          const reEngageText = await this.ai.generateText(
            `Generate a soft, professional re-engagement WhatsApp message for a real estate lead named ${lead.name} who hasn't been active for ${daysSince} days. Just the message.`
          );

          // Log activity
          await this.prisma.activity.create({
            data: {
              tenantId: lead.tenantId,
              leadId: lead.id,
              type: 'AI_ACTION' as any,
              title: 'Stale Lead Recommendation',
              description: `AI suggested follow-up: "${reEngageText}"`,
            },
          });

          // Emit real-time notification
          this.events.emitToTenant(lead.tenantId, 'lead:stale', {
            leadId: lead.id,
            name: lead.name,
            daysSince,
            suggestion: reEngageText
          });

          this.logger.warn(`Stale Lead Alert: ${lead.name} (${daysSince} days)`);
          processed++;
        } catch (leadErr) {
          this.logger.error(`Failed to process stale lead ${lead.id}`, leadErr);
          Sentry.captureException(leadErr);
        }
      }
      this.logger.log(`Worker StaleLeadWorker completed: ${processed} leads processed`);
    } catch (err) {
      this.logger.error('Stale lead cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }
}
