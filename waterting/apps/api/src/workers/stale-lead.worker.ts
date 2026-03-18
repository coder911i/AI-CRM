import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
// import { NotificationsService } from '../modules/notifications/notifications.service';  // Assuming we have one, or just emitting WS for now. Let's create an activity log and WS emit.
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class StaleLeadWorker {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async checkStaleLeads() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const stale = await this.prisma.lead.findMany({
      where: {
        stage: { notIn: ['BOOKING_DONE', 'LOST'] },
        lastActivityAt: { lt: sevenDaysAgo },
      },
      include: { assignedTo: true },
    });

    // P0 hot leads — 3 day threshold
    const hotStale = await this.prisma.lead.findMany({
      where: {
        stage: { notIn: ['BOOKING_DONE', 'LOST'] },
        score: { gte: 61 },
        lastActivityAt: { lt: threeDaysAgo },
      },
    });

    // Merge Unique
    const staleMap = new Map();
    [...stale, ...hotStale].forEach(lead => staleMap.set(lead.id, lead));
    const allStale = Array.from(staleMap.values());

    for (const lead of allStale) {
      const daysSince = Math.floor(
        (Date.now() - (lead.lastActivityAt?.getTime() ?? lead.createdAt.getTime())) / 86400000
      );
      
      // In-app notification for Sales Manager (just a mock or send to tenant room)
      this.events.emitToTenant(lead.tenantId, 'notification', {
        title: `Stale Lead: ${lead.name}`,
        message: `No activity for ${daysSince} days — currently in ${lead.stage}`,
        type: 'STALE_LEAD',
        leadId: lead.id,
      });
    }
  }
}
