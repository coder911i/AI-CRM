import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

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
}
