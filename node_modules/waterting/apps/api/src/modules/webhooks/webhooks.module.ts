import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { LeadsService } from '../leads/leads.service';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, LeadsService],
})
export class WebhooksModule {}
