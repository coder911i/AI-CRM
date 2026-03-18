import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: EventsGateway,
  ) {}

  async create(data: {
    tenantId: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    leadId?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        ...data,
        isRead: false,
      },
    });

    // Push real-time notification
    this.gateway.emitToUser(data.userId, 'notification', notification);

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
