import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  async create(user: JwtPayload, data: any) {
    return this.prisma.ad.create({
      data: {
        ...data,
        tenantId: user.tenantId,
      },
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.ad.findMany({
      where: { tenantId: user.tenantId },
      include: { project: true, listing: true },
    });
  }

  async update(user: JwtPayload, id: string, data: any) {
    return this.prisma.ad.update({
      where: { id, tenantId: user.tenantId },
      data,
    });
  }

  async remove(user: JwtPayload, id: string) {
    return this.prisma.ad.delete({
      where: { id, tenantId: user.tenantId },
    });
  }

  async getPerformance(user: JwtPayload) {
    const ads = await this.prisma.ad.findMany({
      where: { tenantId: user.tenantId },
    });

    const summary = ads.reduce(
      (acc, ad) => {
        acc.totalSpend += ad.spend || 0;
        acc.totalClicks += ad.clicks || 0;
        acc.totalLeads += ad.leads || 0;
        return acc;
      },
      { totalSpend: 0, totalClicks: 0, totalLeads: 0 }
    );

    return {
      summary,
      ads,
    };
  }
}
