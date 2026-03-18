import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiLeadScoringWorker } from './ai-lead-scoring.worker';
import { EmailWorker } from './email.worker';
import { VisitReminderWorker } from './visit-reminder.worker';
import { PaymentReminderWorker } from './payment-reminder.worker';
import { UnitHoldExpiryWorker } from './unit-hold-expiry.worker';
import { StaleLeadWorker } from './stale-lead.worker';
import { PdfGeneratorWorker } from './pdf-generator.worker';
import { EventsGateway } from '../gateways/events.gateway';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: 'ai-scoring' },
      { name: 'email' },
      { name: 'pdf' },
      { name: 'portal-sync' },
    ),
  ],
  providers: [
    EventsGateway,
    AiLeadScoringWorker,
    EmailWorker,
    VisitReminderWorker,
    PaymentReminderWorker,
    UnitHoldExpiryWorker,
    StaleLeadWorker,
    PdfGeneratorWorker,
  ],
  exports: [EventsGateway]
})
export class WorkersModule {}
