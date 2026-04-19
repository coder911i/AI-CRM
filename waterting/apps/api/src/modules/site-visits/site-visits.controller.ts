import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, VisitOutcome } from '@waterting/shared';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('site-visits')
@ApiBearerAuth('JWT-auth')
@Controller('site-visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new site visit' })
  schedule(@CurrentUser() user: JwtPayload, @Body() data: any) {
    return this.siteVisitsService.schedule(user, data);
  }

  @Get()
  @ApiOperation({ summary: 'List all site visits for the tenant' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.siteVisitsService.findAll(user);
  }

  @Patch(':id/checkin')
  @ApiOperation({ summary: 'Check in for a scheduled visit' })
  async checkIn(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.siteVisitsService.checkIn(user, id);
  }

  @Patch(':id/checkout')
  @ApiOperation({ summary: 'Check out and provide forced feedback' })
  async checkOut(
    @Param('id') id: string,
    @Body() dto: { outcome: VisitOutcome; notes: string; followUpDate?: string; rating?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.siteVisitsService.checkOut(user, id, dto);
  }

  @Patch(':id/outcome')
  @ApiOperation({ summary: 'Record visit outcome manually' })
  recordOutcome(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: { outcome: VisitOutcome; notes?: string; followUpDate?: Date }) {
    return this.siteVisitsService.recordOutcome(user, id, data);
  }
}
