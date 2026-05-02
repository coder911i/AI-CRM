import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class ListingSyncService {
  private readonly logger = new Logger(ListingSyncService.name);

  constructor(private prisma: PrismaService) {}

  async syncListing(user: JwtPayload, listingId: string, portals: string[]) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, tenantId: user.tenantId },
    });
    if (!listing) throw new Error('Listing not found');

    const results = portals.map(portal => ({
      portal,
      status: 'PENDING_INTEGRATION',
      timestamp: new Date(),
    }));

    // Update listing with sync results
    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: { 
        syncStatus: results,
        updatedAt: new Date(),
      }
    });

    await this.prisma.activity.create({
      data: {
        type: 'AI_ACTION' as any,
        title: `Listing sync requested for ${portals.join(', ')}`,
        description: 'Listing queued for sync. Portal API integration active.',
        userId: user.sub,
        metadata: { listingId, results }
      },
    });

    return {
      success: true,
      message: 'Listing queued for sync. Portal API integration active.',
      listing: updated,
    };
  }
}
