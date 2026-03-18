import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(user: JwtPayload, data: any) {
    return this.prisma.listing.create({
      data: {
        ...data,
        tenantId: user.tenantId,
      },
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.listing.findMany({
      where: { tenantId: user.tenantId },
      include: { project: true },
    });
  }

  async syncToPlatform(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    // MOCK SYNCHRONIZATION
    // In production, this would call 99acres or MagicBricks API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return this.prisma.listing.update({
      where: { id: listingId },
      data: { platformId: `EXT-${Math.random().toString(36).substr(2, 9)}`, status: 'ACTIVE' },
    });
  }

  async handleWebhook(tenantId: string, platform: string, payload: any) {
    // Lead auto-import from platforms
    // Standardize payload to Lead format
    const leadData = {
      tenantId,
      name: payload.name || 'Platform Lead',
      phone: payload.phone,
      email: payload.email,
      source: platform as any,
      stage: 'NEW_LEAD' as any,
    };

    return this.prisma.lead.upsert({
      where: { 
        tenantId_phone: { tenantId, phone: leadData.phone } 
      },
      update: { lastActivityAt: new Date() },
      create: leadData,
    });
  }

  async bulkUpdatePrices(tenantId: string, projectId: string, increasePct: number) {
    const factor = 1 + (increasePct / 100);
    
    // Update Units
    await this.prisma.unit.updateMany({
      where: { tower: { projectId }, status: 'AVAILABLE' },
      data: {
        basePrice: { multiply: factor },
        totalPrice: { multiply: factor },
      },
    });

    // Update Listings
    return this.prisma.listing.updateMany({
      where: { tenantId, projectId },
      data: {
        price: { multiply: factor },
      },
    });
  }
}
