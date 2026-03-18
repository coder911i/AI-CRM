import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';

@Processor('email')
export class EmailWorker {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  @Process('send')
  async send(job: Job<{
    to: string;
    subject: string;
    html: string;
    from?: string;
  }>) {
    const { to, subject, html, from } = job.data;
    await this.transporter.sendMail({
      from: from ?? process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  }
}
