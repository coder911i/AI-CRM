import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: JwtPayload) {
    const tenantId = user.tenantId;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const sevenDaysHence = new Date();
    sevenDaysHence.setDate(sevenDaysHence.getDate() + 7);

    const [totalLeads, newLeads, activeLeads, bookings, revenue, siteVisits, recentLeads, stageDistribution, staleLeadsCount, upcomingPayments] =
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
          orderBy: { lastActivityAt: 'desc' },
          include: { project: true, assignedTo: { select: { id: true, name: true } } },
        }),
        this.prisma.lead.groupBy({
          by: ['stage'],
          where: { tenantId },
          _count: { id: true },
        }),
        this.prisma.lead.count({
          where: { 
            tenantId, 
            isArchived: false, 
            stage: { notIn: ['LOST', 'BOOKING_DONE'] },
            lastActivityAt: { lt: threeDaysAgo }
          }
        }),
        this.prisma.payment.findMany({
          where: {
            booking: { lead: { tenantId } },
            paidAt: null,
            dueDate: { gte: new Date(), lte: sevenDaysHence }
          },
          include: { booking: { include: { unit: true } } },
          orderBy: { dueDate: 'asc' },
          take: 5
        })
      ]);

    return {
      totalLeads,
      newLeads,
      activeLeads,
      totalBookings: bookings,
      totalRevenue: revenue._sum.amount || 0,
      todaySiteVisits: siteVisits,
      recentLeads,
      staleLeadsCount,
      upcomingPayments,
      stageDistribution: stageDistribution.map((s) => ({
        stage: s.stage,
        count: s._count.id,
      })),
    };
  }

  async getBuilderStats(user: JwtPayload) {
    const tenantId = user.tenantId;

    const [projects, leads, bookings, revenue, recentLeads, ads] = await Promise.all([
      this.prisma.project.findMany({
        where: { tenantId },
        include: {
          towers: { include: { units: true } },
          leads: { _count: true },
        },
      }),
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.booking.count({ where: { lead: { tenantId } } }),
      this.prisma.payment.aggregate({
        where: { booking: { lead: { tenantId } }, paidAt: { not: null } },
        _sum: { amount: true },
      }),
      this.prisma.lead.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { project: true },
      }),
      this.prisma.ad.findMany({
        where: { tenantId },
        take: 3,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const projectStats = projects.map((p) => {
      const units = p.towers.flatMap((t: any) => t.units);
      const sold = units.filter((u: any) => u.status === 'SOLD' || u.status === 'BOOKED').length;
      return {
        id: p.id,
        name: p.name,
        total: units.length,
        sold,
        leads: (p as any).leads?.length || 0,
        revenue: 0, 
      };
    });

    return {
      totalRevenue: revenue._sum.amount || 0,
      newBookings: bookings,
      activeLeads: leads,
      projects: projectStats,
      recentLeads: recentLeads.map((l: any) => ({
        id: l.id,
        name: l.name,
        project: l.project?.name,
        scoreLabel: l.scoreLabel,
      })),
      ads,
    };
  }
}
