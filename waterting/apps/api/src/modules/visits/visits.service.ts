import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async schedule(data: any) {
    const visit = await this.prisma.propertyVisit.create({
      data: {
        propertyId: data.propertyId,
        brokerId: data.brokerId,
        customerId: data.customerId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      },
      include: {
        property: { include: { owner: true } },
        broker: true,
        customer: true,
      },
    });

    // Create Notification for Property Owner
    await this.prisma.notification.create({
      data: {
        tenantId: visit.property.tenantId,
        userId: visit.property.ownerId,
        title: 'New Visit Scheduled',
        message: `Broker ${visit.broker.name} is bringing customer ${visit.customer.name} to view ${visit.property.title} at ${visit.scheduledAt.toLocaleString()}`,
      },
    });

    return visit;
  }

  async getBrokerVisits(brokerId: string) {
    return this.prisma.propertyVisit.findMany({
      where: { brokerId },
      include: { property: true, customer: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
