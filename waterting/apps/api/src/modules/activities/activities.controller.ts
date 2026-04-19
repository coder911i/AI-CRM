import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload } from '@waterting/shared';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('leads')
@ApiBearerAuth('JWT-auth')
@Controller('leads/:leadId/activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findByLead(@CurrentUser() user: JwtPayload, @Param('leadId') leadId: string) {
    return this.activitiesService.findByLead(user, leadId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Param('leadId') leadId: string, @Body() data: any) {
    return this.activitiesService.create(user, leadId, data);
  }
}
