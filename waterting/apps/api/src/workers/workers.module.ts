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
import { AIService } from '../common/ai/ai.service';
import { AiFollowUpWorker } from './ai-follow-up.worker';
import { DailyBriefingWorker } from './daily-briefing.worker';
import { WhatsAppWorker } from './whatsapp.worker';

import { CommunicationModule } from '../common/comm/communication.module';

@Module({
  imports: [
    PrismaModule,
    CommunicationModule,
    BullModule.registerQueue(
      { name: 'ai-scoring' },
      { name: 'email' },
      { name: 'whatsapp' },
      { name: 'pdf' },
      { name: 'portal-sync' },
    ),
  ],
  providers: [
    EventsGateway,
    AIService,
    AiLeadScoringWorker,
    EmailWorker,
    VisitReminderWorker,
    PaymentReminderWorker,
    UnitHoldExpiryWorker,
    StaleLeadWorker,
    PdfGeneratorWorker,
    AiFollowUpWorker,
    DailyBriefingWorker,
    WhatsAppWorker,
  ],
  exports: [EventsGateway, AiFollowUpWorker]
})
export class WorkersModule {}
