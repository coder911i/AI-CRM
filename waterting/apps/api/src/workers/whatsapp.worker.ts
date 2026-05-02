import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CommunicationService } from '../common/comm/communication.service';

@Processor('whatsapp')
export class WhatsAppWorker {
  private readonly logger = new Logger(WhatsAppWorker.name);

  constructor(private comm: CommunicationService) {}

  @Process('send')
  async handleSend(job: Job<{ to: string; message: string }>) {
    const { to, message } = job.data;
    
    this.logger.log(`Sending WhatsApp message to ${to}...`);
    
    try {
      const res = await this.comm.sendWhatsApp(to, message);
      if (!res.success) {
        throw new Error(res.error || 'Failed to send WhatsApp');
      }
      return res;
    } catch (err) {
      this.logger.error(`Failed to send WhatsApp to ${to}: ${err.message}`);
      throw err;
    }
  }
}
