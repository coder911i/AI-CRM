import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class ListingSyncService {
  private readonly logger = new Logger(ListingSyncService.name);

  constructor(private prisma: PrismaService) {}

  async syncListing(user: JwtPayload, listingId: string, portals: string[]) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, project: { tenantId: user.tenantId } },
      include: { project: true },
    });
    if (!listing) throw new Error('Listing not found');

    const results = [];
    for (const portal of portals) {
      this.logger.log(`Syncing listing ${listingId} to ${portal}...`);
      // Simulate external API call
      const success = Math.random() > 0.1;
      results.push({
        portal,
        status: success ? 'SUCCESS' : 'FAILED',
        timestamp: new Date(),
        referenceId: success ? `SIM-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      });
    }

    // Update listing with sync results or log in activity
    await this.prisma.activity.create({
      data: {
        leadId: null, // This is a property level activity, maybe add propertyId to activity
        type: 'STAGED' as any, // Need to add a SYNC_ACTIVITY type probably
        title: `Listing synced to ${portals.join(', ')}`,
        description: JSON.stringify(results),
        userId: user.sub,
      },
    });

    return results;
  }
}
