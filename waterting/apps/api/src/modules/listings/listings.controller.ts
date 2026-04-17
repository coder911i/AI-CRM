import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('listings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Body() data: any) {
    return this.listingsService.create(user, data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.listingsService.findAll(user);
  }

  @Post(':id/sync')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  sync(@Param('id') id: string) {
    return this.listingsService.syncToPlatform(id);
  }

  @Patch('bulk-prices')
  @Roles(UserRole.TENANT_ADMIN)
  bulkUpdatePrices(@CurrentUser() user: JwtPayload, @Body() data: { projectId: string, increasePct: number }) {
    return this.listingsService.bulkUpdatePrices(user.tenantId, data.projectId, data.increasePct);
  }
}
