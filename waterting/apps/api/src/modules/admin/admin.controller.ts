import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@waterting/shared';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Request() req: any) {
    return this.adminService.getUsers(req.user.tenantId);
  }

  @Post('users')
  createUser(@Request() req: any, @Body() body: any) {
    return this.adminService.createUser(req.user.tenantId, body);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.adminService.updateUser(id, req.user.tenantId, body);
  }

  @Get('kyc')
  getKyc(@Request() req: any) {
    return this.adminService.getKycList(req.user.tenantId);
  }

  @Get('properties')
  getProperties(@Request() req: any) {
    return this.adminService.getProperties(req.user.tenantId);
  }

  @Get('deals')
  getDeals(@Request() req: any) {
    return this.adminService.getAllDeals(req.user.tenantId);
  }

  @Get('analytics')
  getAnalytics(@Request() req: any) {
    return this.adminService.getAnalytics(req.user.tenantId);
  }
}
