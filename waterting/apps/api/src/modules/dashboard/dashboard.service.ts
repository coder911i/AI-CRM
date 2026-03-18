import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: JwtPayload) {
    const tenantId = user.tenantId;

    const [totalLeads, newLeads, activeLeads, bookings, revenue, siteVisits, recentLeads, stageDistribution] =
      await Promise.all([
        this.prisma.lead.count({ where: { tenantId } }),
        this.prisma.lead.count({ where: { tenantId, stage: 'NEW_LEAD' } }),
        this.prisma.lead.count({ where: { tenantId, isArchived: false, stage: { notIn: ['LOST', 'BOOKING_DONE'] } } }),
        this.prisma.booking.count({ where: { lead: { tenantId } } }),
        this.prisma.payment.aggregate({
          where: { booking: { lead: { tenantId } }, paidAt: { not: null } },
          _sum: { amount: true },
        }),
        this.prisma.siteVisit.count({
          where: { lead: { tenantId }, scheduledAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        this.prisma.lead.findMany({
          where: { tenantId },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { project: true, assignedTo: { select: { id: true, name: true } } },
        }),
        this.prisma.lead.groupBy({
          by: ['stage'],
          where: { tenantId },
          _count: { id: true },
        }),
      ]);

    return {
      totalLeads,
      newLeads,
      activeLeads,
      totalBookings: bookings,
      totalRevenue: revenue._sum.amount || 0,
      todaySiteVisits: siteVisits,
      recentLeads,
      stageDistribution: stageDistribution.map((s) => ({
        stage: s.stage,
        count: s._count.id,
      })),
    };
  }
}
