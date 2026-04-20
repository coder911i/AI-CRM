import { Controller, Post, Get, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@waterting/shared';

@Controller('allocation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post('trigger')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_AGENT) // Or public if triggered from buyer portal
  async trigger(@Request() req: any, @Body() body: { leadId: string; propertyId: string; action: string }) {
    return this.allocationService.triggerAllocation(body.leadId, body.propertyId, body.action, req.user.tenantId);
  }

  @Post(':id/confirm-slot')
  async confirmSlot(@Param('id') allocationId: string, @Body('slotId') slotId: string, @Request() req: any) {
    // sub could be leadId in portal context
    return this.allocationService.confirmSlot(allocationId, slotId, req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.allocationService.findOne(id);
  }

  @Patch(':id/flag')
  @Roles(UserRole.SALES_AGENT, UserRole.TENANT_ADMIN)
  async flag(@Param('id') id: string, @Body('fraudNote') fraudNote: string) {
     return this.allocationService.flagDeal(id, fraudNote);
  }

  @Patch(':id/override-broker')
  @Roles(UserRole.SALES_AGENT, UserRole.TENANT_ADMIN)
  async overrideBroker(@Param('id') id: string, @Body('brokerId') brokerId: string) {
    return this.allocationService.overrideBroker(id, brokerId);
  }
}
