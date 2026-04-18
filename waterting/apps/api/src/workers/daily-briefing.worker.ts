import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { AIService } from '../common/ai/ai.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DailyBriefingWorker {
  private readonly logger = new Logger(DailyBriefingWorker.name);

  constructor(
    private prisma: PrismaService,
    private ai: AIService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  @Cron('30 8 * * *') // 8:30 AM daily
  async generateDailyBriefings() {
    const tenants = await this.prisma.tenant.findMany({ where: { isActive: true } });

    for (const tenant of tenants) {
      this.logger.log(`Generating daily briefing for tenant: ${tenant.name}`);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const [newLeads, visits, bookings, payments] = await Promise.all([
        this.prisma.lead.count({ where: { tenantId: tenant.id, createdAt: { gte: yesterday } } }),
        this.prisma.siteVisit.count({ where: { lead: { tenantId: tenant.id }, createdAt: { gte: yesterday } } }),
        this.prisma.booking.count({ where: { lead: { tenantId: tenant.id }, createdAt: { gte: yesterday } } }),
        this.prisma.payment.aggregate({
          where: { booking: { lead: { tenantId: tenant.id } }, paidAt: { gte: yesterday } },
          _sum: { amount: true }
        }),
      ]);

      const data = {
        tenantName: tenant.name,
        newLeads,
        visits,
        bookings,
        totalRevenue: payments._sum.amount || 0,
      };

      const prompt = `Summarize this real estate CRM data for a sales manager morning briefing.
      Be concise, highlight wins, flag concerns, suggest 1 action for today.
      Data: ${JSON.stringify(data)}
      Return JSON: { "headline": "string", "wins": ["string"], "concerns": ["string"], "suggestedAction": "string", "agentOfTheDay": "string" }`;

      try {
        const brief = await this.ai.generateJSON<any>(prompt);
        
        // Find managers to email
        const managers = await this.prisma.user.findMany({
          where: { tenantId: tenant.id, role: { in: ['TENANT_ADMIN', 'SALES_MANAGER'] }, isActive: true }
        });

        for (const manager of managers) {
          await this.emailQueue.add('send', {
            to: manager.email,
            subject: `Daily Briefing - ${tenant.name}`,
            html: `
              <h2>${brief.headline}</h2>
              <p><strong>Wins:</strong> ${brief.wins.join(', ')}</p>
              <p><strong>Concerns:</strong> ${brief.concerns.join(', ')}</p>
              <p><strong>Action for today:</strong> ${brief.suggestedAction}</p>
              <p><strong>Agent of the day:</strong> ${brief.agentOfTheDay}</p>
            `
          });
        }
      } catch (err) {
        this.logger.error(`Briefing failed for ${tenant.name}`, err);
      }
    }
  }
}
