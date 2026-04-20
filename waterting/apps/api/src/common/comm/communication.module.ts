import { Global, Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { EmailService } from '../email/email.service';

@Global()
@Module({
  providers: [CommunicationService, EmailService],
  exports: [CommunicationService, EmailService],
})
export class CommunicationModule {}
