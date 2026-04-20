import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Waterting" <noreply@waterting.com>',
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendOtp(email: string, otp: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0057FF; margin: 0;">Waterting</h1>
          <p style="color: #666; margin: 5px 0;">Property Coordination Platform</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
          <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #0057FF; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
          <p style="font-size: 14px; color: #888;">Valid for 10 minutes</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Do not share this OTP with anyone.</p>
        </div>
      </div>
    `;
    await this.send(email, 'Your Waterting OTP', html);
  }

  async sendBookingConfirmation(email: string, bookingData: any) {
    // Placeholder for Phase 3
    const html = `<h1>Booking Confirmed</h1><p>Details: ${JSON.stringify(bookingData)}</p>`;
    await this.send(email, 'Booking Confirmation - Waterting', html);
  }
}
