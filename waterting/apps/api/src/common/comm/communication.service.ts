import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
const msg91 = require('msg91-lib');

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);
  private twilioClient: Twilio | null = null;
  private msg91Client: any = null;

  constructor(private config: ConfigService) {
    this.initClients();
  }

  private initClients() {
    const twilioSid = this.config.get('TWILIO_ACCOUNT_SID');
    const twilioToken = this.config.get('TWILIO_AUTH_TOKEN');
    if (twilioSid && twilioToken) {
      this.twilioClient = new Twilio(twilioSid, twilioToken);
    }

    const m91Auth = this.config.get('MSG91_AUTH_KEY');
    if (m91Auth && typeof msg91 === 'function') {
      try {
        this.msg91Client = new (msg91 as any)(
          m91Auth,
          this.config.get('MSG91_SENDER_ID'),
          this.config.get('MSG91_TEMPLATE_ID')
        );
      } catch (e) {
        this.logger.warn(`Failed to init MSG91: ${e.message}`);
      }
    }
  }

  async sendSMS(to: string, message: string) {
    try {
      this.logger.log(`Sending SMS to ${to}...`);
      if (this.msg91Client) {
        await this.msg91Client.sendSMS(to, message);
        return;
      }
      
      if (this.twilioClient) {
        await this.twilioClient.messages.create({
          body: message,
          to,
          from: this.config.get('TWILIO_FROM_NUMBER'),
        });
        return;
      }

      this.logger.warn(`No SMS provider configured. Message skipped: ${message}`);
    } catch (err) {
      this.logger.error(`SMS sending failed: ${err.message}`);
    }
  }

  async sendWhatsApp(to: string, message: string, template?: string, params?: any) {
    try {
      this.logger.log(`Sending WhatsApp to ${to}...`);
      if (!this.twilioClient) {
        this.logger.warn('Twilio not configured. WhatsApp skipped.');
        return { success: false, error: 'Twilio not configured' };
      }
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
