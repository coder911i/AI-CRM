import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
const msg91 = require('msg91-lib');

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);
  private twilioClient: Twilio;
  private msg91Client: any;

  constructor(private config: ConfigService) {
    this.twilioClient = new Twilio(
      this.config.get('TWILIO_ACCOUNT_SID'),
      this.config.get('TWILIO_AUTH_TOKEN')
    );
    this.msg91Client = new msg91(
      this.config.get('MSG91_AUTH_KEY'),
      this.config.get('MSG91_SENDER_ID'),
      this.config.get('MSG91_TEMPLATE_ID')
    );
  }

  async sendSMS(to: string, message: string) {
    try {
      this.logger.log(`Sending SMS to ${to} via MSG91...`);
      // MSG91 Primary
      await this.msg91Client.sendSMS(to, message);
    } catch (err) {
      this.logger.warn(`MSG91 failed, falling back to Twilio: ${err.message}`);
      try {
        await this.twilioClient.messages.create({
          body: message,
          to,
          from: this.config.get('TWILIO_FROM_NUMBER'),
        });
      } catch (twilioErr) {
        this.logger.error(`SMS fallback failed: ${twilioErr.message}`);
        throw twilioErr;
      }
    }
  }

  async sendWhatsApp(to: string, message: string, template?: string, params?: any) {
    try {
      this.logger.log(`Sending WhatsApp to ${to}...`);
      // Meta Graph API or Twilio WhatsApp integration
      await this.twilioClient.messages.create({
        body: message,
        to: `whatsapp:${to}`,
        from: `whatsapp:${this.config.get('TWILIO_FROM_NUMBER')}`,
      });
      return { success: true };
    } catch (err) {
      this.logger.error(`WhatsApp failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
