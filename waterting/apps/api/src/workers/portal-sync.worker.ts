import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { LeadsService } from '../modules/leads/leads.service';
import { LeadSource } from '@waterting/shared';
import axios from 'axios';
import * as Sentry from '@sentry/node';

@Injectable()
export class PortalSyncWorker {
  private readonly logger = new Logger(PortalSyncWorker.name);

  constructor(
    private prisma: PrismaService,
    private leadsService: LeadsService,
  ) {}

  @Cron('0 */2 * * *') // Every 2 hours
  async syncExternalPortals() {
    try {
      this.logger.log('Starting external portal lead sync...');
      const listings = await this.prisma.listing.findMany({
        where: { status: 'ACTIVE' },
        include: { project: true }
      });

      for (const listing of listings) {
        try {
          if (listing.platform === '99ACRES') {
            await this.sync99Acres(listing);
          } else if (listing.platform === 'MAGICBRICKS') {
            await this.syncMagicBricks(listing);
          }
        } catch (listingErr) {
          this.logger.error(`Failed to sync listing ${listing.id}: ${listingErr.message}`);
          Sentry.captureException(listingErr);
        }
      }
    } catch (err) {
      this.logger.error('Portal sync cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }

  private async sync99Acres(listing: any) {
    // Mocking 99Acres API call
    this.logger.log(`Syncing 99Acres for project ${listing.project.name}...`);
    // In reality, call 99acres XML/JSON API with listing.externalId
    
    // Mock response
    const mockLeads = [
      { name: 'John Doe', phone: '9876543210', email: 'john@example.com', notes: 'Interested in 3BHK' },
    ];

    for (const leadData of mockLeads) {
        const superAdmin = await this.prisma.user.findFirst({ where: { tenantId: listing.tenantId }});
        if (superAdmin) {
            const mockUser = { sub: superAdmin.id, tenantId: listing.tenantId, role: superAdmin.role as any, email: superAdmin.email };
            await this.leadsService.create(mockUser, {
                ...leadData,
                projectId: listing.projectId,
                source: LeadSource.PORTAL_99ACRES,
            });
        }
    }
  }

  private async syncMagicBricks(listing: any) {
    this.logger.log(`Syncing MagicBricks for project ${listing.project.name}...`);
    // Similar to 99Acres
  }
}
