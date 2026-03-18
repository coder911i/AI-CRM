import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.payment.update({
      where: { id },
      data: {
        paidAt: new Date(),
        method: data.method,
        referenceNumber: data.referenceNumber,
        receiptUrl: data.receiptUrl,
      },
    });
  }
}
