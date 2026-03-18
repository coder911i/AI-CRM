import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('my-tenant')
  getMyTenant(@CurrentUser() user: JwtPayload) {
    return this.tenantsService.getMyTenant(user);
  }

  @Patch('my-tenant')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  updateMyTenant(@CurrentUser() user: JwtPayload, @Body() updateData: any) {
    return this.tenantsService.updateMyTenant(user, updateData);
  }
}
