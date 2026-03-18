import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class VisitReminderWorker {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  @Cron('0 8 * * *') // Daily 8 AM
  async send24hReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow.setHours(0, 0, 0, 0));
    const end = new Date(tomorrow.setHours(23, 59, 59, 999));

    const visits = await this.prisma.siteVisit.findMany({
      where: { scheduledAt: { gte: start, lte: end }, outcome: null },
      include: { lead: true, agent: true },
    });

    for (const visit of visits) {
      if (!visit.lead.email || visit.lead.emailOptOut) continue;
      await this.emailQueue.add('send', {
        to: visit.lead.email,
        subject: `Reminder: Visit tomorrow`,
        html: `Hi ${visit.lead.name}, your site visit is tomorrow at ${visit.scheduledAt.toLocaleString('en-IN')}`,
      });
    }
  }

  @Cron('0 * * * *') // Every hour
  async send2hReminders() {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const windowStart = new Date(twoHoursLater.getTime() - 10 * 60 * 1000);
    const windowEnd = new Date(twoHoursLater.getTime() + 10 * 60 * 1000);

    const visits = await this.prisma.siteVisit.findMany({
      where: { scheduledAt: { gte: windowStart, lte: windowEnd }, outcome: null },
      include: { lead: true },
    });

    for (const visit of visits) {
      if (!visit.lead.email || visit.lead.emailOptOut) continue;
      await this.emailQueue.add('send', {
        to: visit.lead.email,
        subject: `Your visit is in 2 hours`,
        html: `Hi ${visit.lead.name}, your site visit is in 2 hours at ${visit.scheduledAt.toLocaleTimeString('en-IN')}.`,
      });
    }
  }
}
