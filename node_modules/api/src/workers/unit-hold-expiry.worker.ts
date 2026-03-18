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
      // Notify tenant
      const tenantId = unit.tower?.project?.tenantId;
      if (tenantId) {
        this.events.emitToTenant(tenantId, 'unit:status', {
          unitId: unit.id,
          status: 'AVAILABLE',
        });
      }
      
      // Could potentially log activity or notify the agent who reserved it
    }
  }
}
