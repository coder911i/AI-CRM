import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('whatsapp')
export class WhatsAppWorker {
  private readonly logger = new Logger(WhatsAppWorker.name);

  @Process('send')
  async handleSend(job: Job<{ to: string; message: string }>) {
    const { to, message } = job.data;
    
    this.logger.log(`[WHATSAPP MOCK] Sending message to ${to}...`);
    this.logger.log(`[CONTENT]: ${message}`);

    // In production, integrate with Meta Graph API or Twilio
    // await this.whatsAppService.sendMessage(to, message);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    
    this.logger.log(`[WHATSAPP MOCK] Message sent successfully to ${to}`);
    return { success: true, timestamp: new Date().toISOString() };
  }
}
