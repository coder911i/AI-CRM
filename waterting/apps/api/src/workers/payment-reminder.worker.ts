import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PaymentReminderWorker {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  @Cron('0 9 * * *') // Daily 9 AM
  async checkPayments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endIn7Days = new Date(in7Days);
    endIn7Days.setHours(23, 59, 59, 999);

    const in1Day = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
    const endIn1Day = new Date(in1Day);
    endIn1Day.setHours(23, 59, 59, 999);

    // 7-day reminders
    const due7 = await this.prisma.payment.findMany({
      where: {
        paidAt: null,
        dueDate: { gte: in7Days, lte: endIn7Days },
      },
      include: { booking: { include: { lead: true } } },
    });
    for (const p of due7) {
      if (!p.booking.buyerEmail) continue;
      await this.emailQueue.add('send', {
        to: p.booking.buyerEmail,
        subject: `Payment due in 7 days — ₹${p.amount.toLocaleString('en-IN')}`,
        html: `Hi ${p.booking.buyerName}, your installment of ₹${p.amount.toLocaleString('en-IN')} is due on ${p.dueDate.toLocaleDateString('en-IN')}.`,
      });
    }

    // 1-day reminders
    const due1 = await this.prisma.payment.findMany({
      where: {
        paidAt: null,
        dueDate: { gte: in1Day, lte: endIn1Day },
      },
      include: { booking: { include: { lead: true } } },
    });
    for (const p of due1) {
      if (!p.booking.buyerEmail) continue;
      await this.emailQueue.add('send', {
        to: p.booking.buyerEmail,
        subject: `Payment due tomorrow — ₹${p.amount.toLocaleString('en-IN')}`,
        html: `Hi ${p.booking.buyerName}, your installment of ₹${p.amount.toLocaleString('en-IN')} is due tomorrow, ${p.dueDate.toLocaleDateString('en-IN')}.`,
      });
    }

    // Overdue — mark and escalate
    const overdue = await this.prisma.payment.findMany({
      where: { paidAt: null, dueDate: { lt: today }, isOverdue: false },
    });
    for (const p of overdue) {
      await this.prisma.payment.update({
        where: { id: p.id },
        data: { isOverdue: true },
      });
    }
  }
}
