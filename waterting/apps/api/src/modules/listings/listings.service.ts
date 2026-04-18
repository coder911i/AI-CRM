import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: JwtPayload, query?: any) {
    return this.prisma.listing.findMany({
      where: {
        tenantId: user.tenantId,
        ...(query?.platform && { platform: query.platform }),
        ...(query?.status && { status: query.status }),
        ...(query?.projectId && { projectId: query.projectId }),
      },
      include: { project: { select: { id: true, name: true, location: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(user: JwtPayload, dto: any) {
    return this.prisma.listing.create({
      data: { ...dto, tenantId: user.tenantId },
    });
  }

  async update(user: JwtPayload, id: string, dto: any) {
    const listing = await this.prisma.listing.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!listing) throw new NotFoundException('Listing not found');
    return this.prisma.listing.update({ where: { id }, data: dto });
  }

  async remove(user: JwtPayload, id: string) {
    const listing = await this.prisma.listing.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!listing) throw new NotFoundException('Listing not found');
    return this.prisma.listing.delete({ where: { id } });
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
    
    await this.prisma.unit.updateMany({
      where: { tower: { projectId }, status: 'AVAILABLE' },
      data: {
        basePrice: { multiply: factor },
        totalPrice: { multiply: factor },
      },
    });

    return this.prisma.listing.updateMany({
      where: { tenantId, projectId },
      data: {
        price: { multiply: factor },
      },
    });
  }
}
