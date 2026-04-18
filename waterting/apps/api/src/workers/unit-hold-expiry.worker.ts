import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class UnitHoldExpiryWorker {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  @Cron('*/30 * * * *') // Every 30 minutes
  async releaseExpiredHolds() {
    const expired = await this.prisma.unit.findMany({
      where: {
        status: 'RESERVED',
        holdUntil: { lt: new Date() },
      },
      include: { tower: { include: { project: true } } },
    });

    for (const unit of expired) {
      await this.prisma.unit.update({
        where: { id: unit.id },
        data: { status: 'AVAILABLE', holdUntil: null },
      });

      // Find the lead this was reserved for (if any) to notify agent
      const booking = await this.prisma.booking.findFirst({
        where: { unitId: unit.id, status: 'INITIATED' },
        include: { lead: true }
      });

      if (booking?.lead) {
        await this.prisma.activity.create({
          data: {
            leadId: booking.leadId,
            type: 'SYSTEM' as any,
            title: 'Unit Hold Expired',
            description: `Hold on unit ${unit.unitNumber} has expired. Unit is now AVAILABLE.`,
          }
        });
      }

      // Notify tenant
      const tenantId = unit.tower?.project?.tenantId;
      if (tenantId) {
        this.events.emitToTenant(tenantId, 'unit:status', {
          unitId: unit.id,
          status: 'AVAILABLE',
          unitNumber: unit.unitNumber,
        });
      }
    }
  }
}
