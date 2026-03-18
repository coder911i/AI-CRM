import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, VisitOutcome } from '@waterting/shared';

@Controller('site-visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Post()
  schedule(@CurrentUser() user: JwtPayload, @Body() data: any) {
    return this.siteVisitsService.schedule(user, data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.siteVisitsService.findAll(user);
  }

  @Patch(':id/outcome')
  recordOutcome(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('outcome') outcome: VisitOutcome,
    @Body('notes') notes?: string,
  ) {
    return this.siteVisitsService.recordOutcome(user, id, outcome, notes);
  }
}
