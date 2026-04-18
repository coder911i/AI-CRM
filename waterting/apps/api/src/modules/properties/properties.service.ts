import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, ownerId: string, data: any) {
    return this.prisma.property.create({
      data: {
        ...data,
        tenantId,
        ownerId,
        status: 'AVAILABLE',
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.property.findMany({
      where: { tenantId },
      include: { owner: { select: { name: true, phone: true } } },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { owner: true, visits: true },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async getOwnerDashboard(ownerId: string) {
    return this.prisma.property.findMany({
      where: { ownerId },
      include: {
        visits: {
          include: {
            broker: { select: { name: true, phone: true } },
            customer: { select: { name: true, phone: true } },
          },
        },
      },
    });
  }
}
