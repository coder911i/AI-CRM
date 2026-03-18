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

  async findAll(user: JwtPayload) {
    return this.prisma.broker.findMany({
      where: { tenantId: user.tenantId },
      include: {
        _count: {
          select: { leads: true, commissions: true }
        }
      }
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
}
