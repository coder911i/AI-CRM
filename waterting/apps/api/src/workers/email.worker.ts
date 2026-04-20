import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from '../common/email/email.service';

@Processor('email')
export class EmailWorker {
  constructor(private emailService: EmailService) {}

  @Process('send')
  async send(job: Job<{
    to: string;
    subject: string;
    html: string;
    from?: string;
  }>) {
    const { to, subject, html } = job.data;
    await this.emailService.send(to, subject, html);
  }
}
