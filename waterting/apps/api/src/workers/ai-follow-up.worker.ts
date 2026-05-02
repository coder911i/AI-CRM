import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import { AIService } from '../common/ai/ai.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class AiFollowUpWorker {
  private readonly logger = new Logger(AiFollowUpWorker.name);

  constructor(
    private prisma: PrismaService,
    private ai: AIService,
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('whatsapp') private waQueue: Queue,
  ) {}

  // Daily at 6 AM
  @Cron('0 6 * * *')
  async processSequences() {
    try {
      this.logger.log('Starting daily AI follow-up sequences...');
      const now = new Date();
      let processedCount = 0;

      // 1. WhatsApp Nudge (New Leads - 2h after creation)
      try {
        const newLeads = await this.prisma.lead.findMany({
          where: {
            createdAt: { 
              gte: new Date(now.getTime() - 3 * 3600000), 
              lte: new Date(now.getTime() - 2 * 3600000) 
            },
            activities: { none: { type: 'WHATSAPP' } }
          },
          include: { project: true }
        });
        for (const lead of newLeads) {
          await this.sendWhatsAppNudge(lead, 'welcome-nudge');
          processedCount++;
        }
      } catch (e) {
        this.logger.error('WhatsApp Nudge sequence failed', e);
        Sentry.captureException(e);
      }

      // 1. No-Response Drip
      try {
        const noResponse = await this.prisma.lead.findMany({
          where: {
            emailOptOut: false,
            email: { not: null },
            stage: 'NEW_LEAD',
            createdAt: { lt: new Date(now.getTime() - 24 * 3600000) },
            activities: { none: { type: { in: ['CALL', 'EMAIL', 'WHATSAPP'] } } },
          },
          include: { project: true, assignedTo: true },
        });

        for (const lead of noResponse) {
          const daysSince = Math.floor((now.getTime() - lead.createdAt.getTime()) / 86400000);
          const sequenceDay = daysSince === 1 ? 1 : daysSince === 3 ? 3 : daysSince === 7 ? 7 : null;
          if (!sequenceDay) continue;
          await this.sendFollowUpEmail(lead, 'no-response-drip', sequenceDay);
          processedCount++;
        }
      } catch (e) {
        this.logger.error('No-Response Drip sequence failed', e);
        Sentry.captureException(e);
      }

      // 2. Post-Visit Nurture
      try {
        const postVisit = await this.prisma.siteVisit.findMany({
          where: {
            outcome: 'INTERESTED',
            scheduledAt: { lt: new Date(now.getTime() - 4 * 3600000) },
          },
          include: { lead: { include: { project: true } } },
        });

        for (const visit of postVisit) {
          if (!visit.lead.email || visit.lead.emailOptOut) continue;
          if (visit.lead.stage === 'BOOKING_DONE') continue;
          await this.sendFollowUpEmail(visit.lead, 'post-visit-nurture', 0);
          processedCount++;
        }
      } catch (e) {
        this.logger.error('Post-Visit Nurture sequence failed', e);
        Sentry.captureException(e);
      }

      // 3. Re-engagement (90/120/180 days)
      const activeLostDays = [90, 120, 180];
      for (const d of activeLostDays) {
        try {
          const targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() - d);
          const startOfDay = new Date(targetDate.setHours(0,0,0,0));
          const endOfDay = new Date(targetDate.setHours(23,59,59,999));

          const lost = await this.prisma.lead.findMany({
            where: {
              stage: 'LOST',
              emailOptOut: false,
              email: { not: null },
              updatedAt: { gte: startOfDay, lte: endOfDay }
            },
            include: { project: true }
          });

          for (const lead of lost) {
            await this.sendFollowUpEmail(lead, 're-engagement', d);
            processedCount++;
          }
        } catch (e) {
          this.logger.error(`Re-engagement (Day ${d}) sequence failed`, e);
          Sentry.captureException(e);
        }
      }
      this.logger.log(`Worker AiFollowUpWorker completed: ${processedCount} records processed`);
    } catch (err) {
      this.logger.error('AI Follow-up cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }

  async sendPriceDropAlert(projectId: string, newPrice: number) {
    try {
      const hotLeads = await this.prisma.lead.findMany({
        where: {
          projectId,
          score: { gte: 61 },
          emailOptOut: false,
          email: { not: null },
          stage: { notIn: ['BOOKING_DONE', 'LOST'] },
        },
        include: { project: true },
      });
      for (const lead of hotLeads) {
        try {
          await this.sendFollowUpEmail(lead, 'price-drop-alert', 0, { newPrice });
        } catch (e) {
          Sentry.captureException(e);
        }
      }
    } catch (e) {
      this.logger.error(`sendPriceDropAlert failed for project ${projectId}`, e);
      Sentry.captureException(e);
    }
  }

  async sendInventoryUrgency(projectId: string, remainingUnits: number) {
    try {
      if (remainingUnits >= 5) return;
      const hotLeads = await this.prisma.lead.findMany({
        where: {
          projectId,
          score: { gte: 61 },
          emailOptOut: false,
          email: { not: null },
          stage: { notIn: ['BOOKING_DONE', 'LOST'] },
        },
        include: { project: true },
      });
      for (const lead of hotLeads) {
        try {
          await this.sendFollowUpEmail(lead, 'inventory-urgency', 0, { remainingUnits });
        } catch (e) {
          Sentry.captureException(e);
        }
      }
    } catch (e) {
      this.logger.error(`sendInventoryUrgency failed for project ${projectId}`, e);
      Sentry.captureException(e);
    }
  }

  private async sendWhatsAppNudge(lead: any, type: string) {
    const prompt = `Write a short, friendly WhatsApp message for a new real estate lead. Lead name: ${lead.name}. Project: ${lead.project?.name}. Action: ${type}. Keep it under 200 characters. Include an emoji. Return ONLY JSON: {"message": "..."}`;
    
    try {
        const res = await this.ai.generateJSON<{ message: string }>(prompt);
        await this.waQueue.add('send', {
          to: lead.phone,
          message: res.message,
        });

        await this.prisma.activity.create({
          data: {
            leadId: lead.id,
            type: 'WHATSAPP',
            title: `AI WhatsApp ${type}`,
            description: res.message,
          },
        });
    } catch (err) {
        this.logger.error(`Failed to send WA nudge: ${err.message}`);
    }
  }

  private async sendFollowUpEmail(lead: any, sequenceType: string, day: number, extra: Record<string, any> = {}) {
    const unsubUrl = `${process.env.FRONTEND_URL}/unsubscribe/${lead.id}`;
    const promptMap: Record<string, string> = {
      'no-response-drip': `Write a friendly, concise real estate follow-up email (Day ${day}). Lead name: ${lead.name}. Project: ${lead.project?.name ?? 'our project'}. Agent: ${lead.assignedTo?.name ?? 'our team'}. Tone: Warm, not pushy. 3 sentences max. End with a soft CTA like "Would you like to schedule a visit?" Return ONLY valid JSON: {"subject": "...", "body": "..."}`,
      'post-visit-nurture': `Write a post-site-visit follow-up email. Lead name: ${lead.name}. Project: ${lead.project?.name ?? 'our project'}. They visited and showed interest. Reinforce their decision. Tone: Excited, reassuring. 3-4 sentences. Return ONLY valid JSON: {"subject": "...", "body": "..."}`,
      'price-drop-alert': `Write a price drop alert email. Lead name: ${lead.name}. Project: ${lead.project?.name ?? 'our project'}. New price: ₹${extra.newPrice?.toLocaleString('en-IN') ?? 'reduced'}. Tone: Urgent but not spammy. 2-3 sentences. Return ONLY valid JSON: {"subject": "...", "body": "..."}`,
      'inventory-urgency': `Write a low inventory urgency email. Lead name: ${lead.name}. Project: ${lead.project?.name ?? 'our project'}. Only ${extra.remainingUnits} units remaining. Tone: Urgent, FOMO-driven but honest. 3 sentences max. Return ONLY valid JSON: {"subject": "...", "body": "..."}`,
      're-engagement': `Write a re-engagement email for a lead who dropped off ${day} days ago. Lead name: ${lead.name}. Project: ${lead.project?.name ?? 'our project'}. Tone: Casual, no hard sell. "Are you still looking?" energy. 2-3 sentences. Return ONLY valid JSON: {"subject": "...", "body": "..."}`,
    };

    const prompt = promptMap[sequenceType];
    if (!prompt) return;

    try {
        const email = await this.ai.generateJSON<{ subject: string; body: string }>(prompt);
        const unsubLine = `<p style="font-size:11px;color:#888;margin-top:20px;"><a href="${unsubUrl}">Unsubscribe from email updates</a></p>`;

        await this.emailQueue.add('send', {
          to: lead.email,
          subject: email.subject,
          html: `<div style="font-family:sans-serif;max-width:600px;">${email.body.replace(/\n/g, '<br/>')}${unsubLine}</div>`,
        });

        await this.prisma.activity.create({
          data: {
            leadId: lead.id,
            type: 'AI_ACTION' as any,
            title: `AI email sent: ${sequenceType} (Day ${day})`,
            description: `Subject: ${email.subject}`,
          },
        });
    } catch (err) {
        this.logger.error(`Failed to generate/send AI follow-up: ${err.message}`);
    }
  }
}
