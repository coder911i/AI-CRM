import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class BuilderService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(user: JwtPayload) {
    const tenantId = user.tenantId;

    const [totalUnits, soldUnits, revenue, leads] = await Promise.all([
      this.prisma.unit.count({ where: { tower: { project: { tenantId } } } }),
      this.prisma.unit.count({ where: { tower: { project: { tenantId } }, status: 'SOLD' } }),
      this.prisma.booking.aggregate({
        where: { unit: { tower: { project: { tenantId } } }, status: 'CONFIRMED' },
        _sum: { bookingAmount: true }
      }),
      this.prisma.lead.findMany({
        where: { tenantId },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      stats: {
        totalUnits,
        soldUnits,
        availableUnits: totalUnits - soldUnits,
        revenue: revenue._sum.bookingAmount || 0,
      },
      recentLeads: leads
    };
  }
}
