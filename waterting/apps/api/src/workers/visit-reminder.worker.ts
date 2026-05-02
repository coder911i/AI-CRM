import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class VisitReminderWorker {
  private readonly logger = new Logger(VisitReminderWorker.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  @Cron('0 8 * * *') // Daily 8 AM
  async send24hReminders() {
    try {
      this.logger.log('Starting 24h site visit reminders...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = new Date(tomorrow.setHours(0, 0, 0, 0));
      const end = new Date(tomorrow.setHours(23, 59, 59, 999));

      const visits = await this.prisma.siteVisit.findMany({
        where: { scheduledAt: { gte: start, lte: end }, outcome: null },
        include: { lead: true, agent: true },
      });

      let processed = 0;
      for (const visit of visits) {
        try {
          if (!visit.lead.email || visit.lead.emailOptOut) continue;
          await this.emailQueue.add('send', {
            to: visit.lead.email,
            subject: `Reminder: Visit tomorrow`,
            html: `Hi ${visit.lead.name}, your site visit is tomorrow at ${visit.scheduledAt.toLocaleString('en-IN')}`,
          });
          processed++;
        } catch (e) {
          Sentry.captureException(e);
        }
      }
      this.logger.log(`Worker VisitReminderWorker (24h) completed: ${processed} records processed`);
    } catch (err) {
      this.logger.error('24h visit reminder cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }

  @Cron('0 * * * *') // Every hour
  async send2hReminders() {
    try {
      this.logger.log('Checking for 2h site visit reminders...');
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const windowStart = new Date(twoHoursLater.getTime() - 10 * 60 * 1000);
      const windowEnd = new Date(twoHoursLater.getTime() + 10 * 60 * 1000);

      const visits = await this.prisma.siteVisit.findMany({
        where: { scheduledAt: { gte: windowStart, lte: windowEnd }, outcome: null },
        include: { lead: true },
      });

      let processed = 0;
      for (const visit of visits) {
        try {
          if (!visit.lead.email || visit.lead.emailOptOut) continue;
          await this.emailQueue.add('send', {
            to: visit.lead.email,
            subject: `Your visit is in 2 hours`,
            html: `Hi ${visit.lead.name}, your site visit is in 2 hours at ${visit.scheduledAt.toLocaleTimeString('en-IN')}.`,
          });
          processed++;
        } catch (e) {
          Sentry.captureException(e);
        }
      }
      this.logger.log(`Worker VisitReminderWorker (2h) completed: ${processed} records processed`);
    } catch (err) {
      this.logger.error('2h visit reminder cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }

  @Cron('0 9 * * *') // Daily 9 AM
  async sendCoordinatedReminders() {
    try {
      this.logger.log('Starting coordinated site visit reminders...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = new Date(tomorrow.setHours(0, 0, 0, 0));
      const end = new Date(tomorrow.setHours(23, 59, 59, 999));

      const slots = await this.prisma.visitSlot.findMany({
        where: { proposedAt: { gte: start, lte: end }, isConfirmed: true },
        include: { allocation: { include: { lead: true, broker: { select: { phone: true, name: true } } } } }
      });

      let processed = 0;
      for (const slot of slots) {
        try {
          const lead = slot.allocation.lead;
          if (!lead.email || lead.emailOptOut) continue;
          
          await this.emailQueue.add('send', {
            to: lead.email,
            subject: 'Reminder: Coordinated Site Visit tomorrow',
            html: `Hi ${lead.name}, your visit is confirmed for tomorrow at ${slot.proposedAt.toLocaleTimeString()}. ${slot.allocation.broker ? `Your broker ${slot.allocation.broker.name} will be there to assist you.` : ''}`
          });
          processed++;
        } catch (e) {
          Sentry.captureException(e);
        }
      }
      this.logger.log(`Worker VisitReminderWorker (coordinated) completed: ${processed} records processed`);
    } catch (err) {
      this.logger.error('Coordinated visit reminder cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }
}
