import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OwnerPortalService } from './owner-portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@waterting/shared';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROPERTY_OWNER)
export class OwnerPortalController {
  constructor(private readonly ownerService: OwnerPortalService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.ownerService.getDashboard(req.user.sub, req.user.tenantId);
  }

  @Get('properties')
  getProperties(@Request() req: any) {
    return this.ownerService.getProperties(req.user.sub);
  }

  @Post('properties')
  createProperty(@Request() req: any, @Body() body: any) {
    return this.ownerService.createProperty(req.user.sub, req.user.tenantId, body);
  }

  @Patch('properties/:id')
  updateProperty(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.ownerService.updateProperty(id, req.user.sub, body);
  }

  @Delete('properties/:id')
  deleteProperty(@Param('id') id: string, @Request() req: any) {
    return this.ownerService.deleteProperty(id, req.user.sub);
  }

  @Get('leads')
  getLeads(@Request() req: any) {
    return this.ownerService.getLeads(req.user.sub);
  }

  @Get('visits')
  getVisits(@Request() req: any) {
    return this.ownerService.getVisits(req.user.sub);
  }

  @Post('broker-rating')
  rateBroker(@Request() req: any, @Body() body: { allocationId: string; rating: number; comment: string }) {
    return this.ownerService.rateBroker(req.user.sub, body.allocationId, body.rating, body.comment);
  }
}
