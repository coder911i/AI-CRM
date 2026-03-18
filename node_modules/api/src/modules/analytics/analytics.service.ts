import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getInventoryInsights(tenantId: string, projectId?: string) {
    // 1. Total Inventory & Status Breakdown
    const units = await this.prisma.unit.findMany({
      where: projectId 
        ? { tower: { projectId } } 
        : { tower: { project: { tenantId } } },
      select: { status: true, totalPrice: true },
    });

    const counts = {
      TOTAL: units.length,
      AVAILABLE: units.filter(u => u.status === 'AVAILABLE').length,
      BOOKED: units.filter(u => u.status === 'BOOKED').length,
      SOLD: units.filter(u => u.status === 'SOLD').length,
      RESERVED: units.filter(u => u.status === 'RESERVED').length,
    };

    // 2. Sales Value
    const salesValue = units
      .filter(u => u.status === 'BOOKED' || u.status === 'SOLD')
      .reduce((acc, u) => acc + u.totalPrice, 0);

    // 3. Absorption Rate (Booking per month - simplify simplified)
    const bookings = await this.prisma.booking.count({
      where: { lead: { tenantId }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    });

    return {
      statusBreakdown: counts,
      totalSalesValue: salesValue,
      absorptionRate30d: bookings,
      occupancyPct: Math.round(((counts.TOTAL - counts.AVAILABLE) / counts.TOTAL) * 100) || 0,
    };
  }
}
