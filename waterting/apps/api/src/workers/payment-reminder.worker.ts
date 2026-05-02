import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import { CommunicationService } from '../common/comm/communication.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class PaymentReminderWorker {
  private readonly logger = new Logger(PaymentReminderWorker.name);

  constructor(
    private prisma: PrismaService,
    private comm: CommunicationService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  @Cron('0 9 * * *') // Daily 9 AM
  async handlePaymentReminders() {
    try {
      this.logger.log('Starting payment reminder cron...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const payments = await this.prisma.payment.findMany({
        where: { 
          paidAt: null, 
          dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } 
        },
        include: { 
          booking: { 
            include: { 
              lead: true,
              unit: {
                include: {
                  tower: {
                    include: {
                      project: true
                    }
                  }
                }
              }
            } 
          } 
        }
      });

      let processed = 0;
      for (const payment of payments) {
        try {
          const daysUntilDue = Math.ceil((payment.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue < 0 && !payment.isOverdue) {
            await this.prisma.payment.update({ where: { id: payment.id }, data: { isOverdue: true } });
            this.logger.warn(`Payment ${payment.id} marked as OVERDUE`);
          }

          if (daysUntilDue === 1 || daysUntilDue === 7) {
            const phone = payment.booking?.lead?.phone || payment.booking?.buyerPhone;
            const email = payment.booking?.lead?.email || payment.booking?.buyerEmail;
            const amount = payment.amount;

            if (phone) {
              const projectName = (payment.booking as any)?.unit?.tower?.project?.name || 'our project';
              await this.comm.sendWhatsApp(phone, `Reminder: Your payment of ₹${amount.toLocaleString('en-IN')} is due in ${daysUntilDue} day(s) for your booking at ${projectName}. Please pay on time to avoid penalties.`);
            }

            if (email) {
              await this.emailQueue.add('send', {
                to: email,
                subject: `Payment Reminder: Due in ${daysUntilDue} Day(s)`,
                html: `Hi ${payment.booking.buyerName}, your installment of ₹${amount.toLocaleString('en-IN')} is due on ${payment.dueDate.toLocaleDateString('en-IN')}.`,
              });
            }
          }
          processed++;
        } catch (recordErr) {
          this.logger.error(`Payment reminder failed for payment ${payment.id}:`, recordErr);
          Sentry.captureException(recordErr);
        }
      }
      this.logger.log(`Payment reminder cron completed: ${processed} records processed`);
    } catch (err) {
      this.logger.error('Payment reminder cron failed entirely:', err);
      Sentry.captureException(err);
    }
  }
}
