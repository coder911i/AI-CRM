import { Controller, Get, Post, Body, Query, Param, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
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
  handleFacebookLead(@Param('tenantId') tenantId: string, @Body() body: any, @Req() req: Request) {
    const rawBody = JSON.stringify(body);
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!this.verifyFacebookSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    return this.webhooksService.handleFacebookLead(tenantId, body);
  }

  private verifyFacebookSignature(payload: string, signature: string): boolean {
    const appSecret = process.env.FB_APP_SECRET;
    if (!appSecret || !signature) return false;
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch (e) {
      return false;
    }
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
  async universalInbound(@Param('tenantId') tenantId: string, @Body() body: any, @Headers('x-webhook-secret') secret: string) {
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
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
