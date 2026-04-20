import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AgentPanelService } from './agent-panel.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@waterting/shared';

@Controller('agent-panel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALES_AGENT)
export class AgentPanelController {
  constructor(private readonly agentService: AgentPanelService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.agentService.getDashboard(req.user.sub);
  }

  @Get('deals')
  getDeals(@Request() req: any) {
    return this.agentService.getDeals(req.user.sub);
  }

  @Patch('deals/:id/flag')
  flagDeal(@Param('id') id: string, @Request() req: any, @Body('note') note: string) {
    return this.agentService.flagDeal(id, req.user.sub, note);
  }

  @Patch('deals/:id/override-broker')
  overrideBroker(@Param('id') id: string, @Request() req: any, @Body('brokerId') brokerId: string) {
    return this.agentService.overrideBroker(id, req.user.sub, brokerId);
  }
}
