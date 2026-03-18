import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';
import * as crypto from 'crypto';

@Injectable()
export class BrokersService {
  constructor(private prisma: PrismaService) {}

  async create(user: JwtPayload, data: any) {
    // Generate unique referral code
    const referralCode = data.referralCode || crypto.randomBytes(4).toString('hex').toUpperCase();

    return this.prisma.broker.create({
      data: {
        ...data,
        referralCode,
        tenantId: user.tenantId,
      },
    });
  }

  async findAll(user: JwtPayload, page = 1, limit = 50) {
    return this.prisma.broker.findMany({
      where: { tenantId: user.tenantId },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        _count: {
          select: { leads: true, commissions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    const broker = await this.prisma.broker.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { leads: true, commissions: true },
    });
    if (!broker) throw new NotFoundException('Broker not found');
    return broker;
  }

  async getStatement(user: JwtPayload, id: string) {
    const broker = await this.prisma.broker.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        commissions: {
          include: {
            booking: {
              include: { unit: { include: { tower: { include: { project: true } } } } }
            }
          }
        }
      },
    });
    if (!broker) throw new NotFoundException('Broker not found');

    const totalCommission = broker.commissions.reduce((sum, c) => sum + c.amount, 0);
    const paidCommission = broker.commissions.filter(c => c.isPaid).reduce((sum, c) => sum + c.amount, 0);

    return {
      broker: {
        name: broker.name,
        email: broker.email,
        phone: broker.phone,
      },
      summary: {
        totalCommission,
        paidCommission,
        pendingCommission: totalCommission - paidCommission,
      },
      transactions: broker.commissions.map(c => ({
        id: c.id,
        amount: c.amount,
        isPaid: c.isPaid,
        paidAt: c.paidAt,
        createdAt: c.createdAt,
        project: c.booking.unit.tower.project.name,
        unit: c.booking.unit.unitNumber,
        buyer: c.booking.buyerName,
      })),
    };
  }
}
