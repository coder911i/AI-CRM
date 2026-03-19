import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { LeadsService } from '../leads/leads.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    NotificationsModule,
    BullModule.registerQueue(
      { name: 'ai-scoring' },
      { name: 'email' },
      { name: 'pdf' },
    ),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, LeadsService],
})
export class WebhooksModule {}
