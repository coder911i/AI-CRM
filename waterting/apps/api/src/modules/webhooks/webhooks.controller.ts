import { Controller, Get, Post, Body, Query, Param, UseGuards, Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { LeadsService } from '../leads/leads.service';
import { Public } from '../../common/decorators/public.decorator';

import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('leads')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly leadsService: LeadsService,
  ) {}

  @Public()
  @Get('facebook')
  verifyFacebook(@Query() query: any) {
    return this.webhooksService.verifyFacebookWebhook(query);
  }

  @Public()
  @Post('facebook/:tenantId')
  handleFacebookLead(@Param('tenantId') tenantId: string, @Body() body: any) {
    return this.webhooksService.handleFacebookLead(tenantId, body);
  }

  @Public()
  @Post('99acres/:tenantId')
  async ninetyNineAcres(@Param('tenantId') tenantId: string, @Body() body: any) {
    const lead = this.mapPortalLead(body, 'PORTAL_99ACRES');
    return this.leadsService.createFromWebhook({ ...lead, tenantId });
  }

  @Public()
  @Post('magicbricks/:tenantId')
  async magicBricks(@Param('tenantId') tenantId: string, @Body() body: any) {
    const lead = this.mapPortalLead(body, 'PORTAL_MAGICBRICKS');
    return this.leadsService.createFromWebhook({ ...lead, tenantId });
  }

  @Public()
  @Post('inbound/:tenantId')
  async universalInbound(@Param('tenantId') tenantId: string, @Body() body: any) {
    // Generic mapping approach
    const lead = {
      name: body.name || body.full_name || body.customer_name || 'Generic Lead',
      phone: String(body.phone || body.mobile || body.contact || ''),
      email: body.email || body.email_id || undefined,
      projectId: body.projectId || body.project_id || undefined,
      source: body.source || 'INBOUND_WEBHOOK',
      utmSource: body.utm_source || body.source || 'WEBHOOK',
      utmCampaign: body.utm_campaign,
    };
    return this.leadsService.createFromWebhook({ ...lead, tenantId });
  }

  private mapPortalLead(body: any, source: string) {
    return {
      name: body.name ?? body.full_name ?? body.contact_name ?? 'Unknown',
      phone: body.phone ?? body.mobile ?? body.contact_number ?? '',
      email: body.email ?? body.email_id ?? undefined,
      source,
      utmSource: source,
    };
  }
}
