import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BrokerPortalService } from './broker-portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@waterting/shared';

@Controller('broker-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BROKER)
export class BrokerPortalController {
  constructor(private readonly brokerService: BrokerPortalService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    // sub could be brokerId if token issued for broker
    return this.brokerService.getDashboard(req.user.sub);
  }

  @Get('leads')
  getLeads(@Request() req: any) {
    return this.brokerService.getLeads(req.user.sub);
  }

  @Get('leads/:id')
  getLeadDetail(@Param('id') id: string, @Request() req: any) {
    return this.brokerService.getLeadDetail(id, req.user.sub);
  }

  @Post('visits/:id/outcome')
  updateOutcome(@Param('id') visitId: string, @Request() req: any, @Body() body: any) {
    return this.brokerService.updateVisitOutcome(visitId, req.user.sub, body);
  }

  @Get('commissions')
  getCommissions(@Request() req: any) {
    return this.brokerService.getCommissions(req.user.sub);
  }
}
