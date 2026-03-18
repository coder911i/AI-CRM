import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(user: JwtPayload, bookingId: string, data: any) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, lead: { tenantId: user.tenantId } },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.payment.create({
      data: {
        ...data,
        bookingId,
      },
    });
  }

  async findAllByBooking(user: JwtPayload, bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId, booking: { lead: { tenantId: user.tenantId } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async recordPayment(user: JwtPayload, id: string, data: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, booking: { lead: { tenantId: user.tenantId } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        method: data.method,
        referenceNumber: data.referenceNumber,
        receiptUrl: data.receiptUrl,
        isVerified: false, // Manual verification needed by Accounts
      },
    });

    await this.audit.log(
      user.tenantId,
      'RECORD_PAYMENT',
      'Payment',
      id,
      user.sub,
      payment,
      updated,
    );

    return updated;
  }

  async verifyPayment(user: JwtPayload, id: string, isVerified: boolean) {
    if (user.role !== 'ACCOUNTS' && user.role !== 'TENANT_ADMIN') {
      throw new Error('Only accounts role can verify payments');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { id, booking: { lead: { tenantId: user.tenantId } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.payment.update({
      where: { id },
      data: { isVerified },
    });

    await this.audit.log(
      user.tenantId,
      'VERIFY_PAYMENT',
      'Payment',
      id,
      user.sub,
      payment,
      updated,
    );

    return updated;
  }
}
