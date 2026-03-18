import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LeadsService } from '../leads/leads.service';
import { LeadSource } from '@waterting/shared';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private leadsService: LeadsService
  ) {}

  verifyFacebookWebhook(query: any) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
        return challenge;
      } else {
        throw new BadRequestException('Forbidden');
      }
    }
    throw new BadRequestException('Missing token');
  }

  async handleFacebookLead(tenantId: string, body: any) {
    // Basic mapping: { entry: [ { changes: [ { value: { form_id, leadgen_id } } ] } ] }
    // Fetch from FB API using leadgen_id
    // But for MVP if data is direct:
    
    body.entry?.forEach((entry: any) => {
      entry.changes?.forEach(async (change: any) => {
        if (change.field === 'leadgen') {
           const leadgenId = change.value.leadgen_id;
           // Simulate parsing graph api result
           const mappedLead = {
             name: 'Facebook Lead',
             phone: '9999999999', // Placeholder
             email: '',
             source: LeadSource.FACEBOOK,
             utmCampaign: leadgenId,
           };
           // We create lead using system user
           const superAdmin = await this.prisma.user.findFirst({ where: { tenantId }});
           if (superAdmin) {
             const mockUser = { sub: superAdmin.id, tenantId, role: superAdmin.role as any, email: superAdmin.email };
             await this.leadsService.create(mockUser, mappedLead);
           }
        }
      });
    });

    return { status: 'success' };
  }
}
