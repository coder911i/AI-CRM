import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../gateways/events.gateway';
import * as Sentry from '@sentry/node';

@Injectable()
export class UnitHoldExpiryWorker {
  private readonly logger = new Logger(UnitHoldExpiryWorker.name);

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  @Cron('*/30 * * * *') // Every 30 minutes
  async releaseExpiredHolds() {
    try {
      this.logger.log('Checking for expired unit holds...');
      const expired = await this.prisma.unit.findMany({
        where: {
          status: 'RESERVED',
          holdUntil: { lt: new Date() },
        },
        include: { tower: { include: { project: true } } },
      });

      this.logger.log(`Found ${expired.length} expired holds.`);
      let processed = 0;

      for (const unit of expired) {
        try {
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
          processed++;
        } catch (unitErr) {
          this.logger.error(`Failed to release hold for unit ${unit.id}`, unitErr);
          Sentry.captureException(unitErr);
        }
      }
      this.logger.log(`Worker UnitHoldExpiryWorker completed: ${processed} units processed`);
    } catch (err) {
      this.logger.error('Unit hold expiry cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }
}
