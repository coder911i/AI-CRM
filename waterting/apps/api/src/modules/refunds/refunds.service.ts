import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async requestRefund(user: JwtPayload, bookingId: string, amount: number, reason: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, lead: { tenantId: user.tenantId } },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // Basic validation: total paid must be >= requested refund
    const paid = await this.prisma.payment.aggregate({
      where: { bookingId, paidAt: { not: null } },
      _sum: { amount: true }
    });
    if ((paid._sum.amount || 0) < amount) {
      throw new BadRequestException('Refund amount exceeds total paid amount');
    }

    return this.prisma.refund.create({
      data: {
        bookingId,
        amount,
        reason,
        status: 'PENDING'
      }
    });
  }

  async processRefund(user: JwtPayload, refundId: string, referenceNumber: string) {
    // Only TENANT_ADMIN or ACCOUNTS can process
    const refund = await this.prisma.refund.findFirst({
      where: { id: refundId, booking: { lead: { tenantId: user.tenantId } } },
    });
    if (!refund) throw new NotFoundException('Refund not found');

    return this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'PROCESSED',
        referenceNumber,
        processedAt: new Date()
      }
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.refund.findMany({
      where: { booking: { lead: { tenantId: user.tenantId } } },
      include: { booking: { include: { unit: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
