import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class ConstructionService {
  constructor(private prisma: PrismaService) {}

  async createUpdate(user: JwtPayload, projectId: string, data: any) {
    return this.prisma.constructionUpdate.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async getProjectFeed(projectId: string) {
    return this.prisma.constructionUpdate.findMany({
      where: { projectId },
      orderBy: { updateDate: 'desc' },
    });
  }

  async getBuyerFeed(buyerEmail: string) {
    // 1. Find buyer's booking
    const booking = await this.prisma.booking.findFirst({
      where: { buyerEmail },
      include: { unit: { include: { tower: true } } },
    });

    if (!booking) throw new NotFoundException('No booking found');

    // 2. Return construction feed for the project
    return this.getProjectFeed(booking.unit.tower.projectId);
  }
}
