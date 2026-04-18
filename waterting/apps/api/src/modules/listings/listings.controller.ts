import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { ListingsService } from './listings.service';

@Controller('listings')
@UseGuards(JwtAuthGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: any) {
    return this.listingsService.findAll(user, query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Body() dto: any) {
    return this.listingsService.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: any) {
    return this.listingsService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.listingsService.remove(user, id);
  }

  @Post(':id/sync')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  sync(@Param('id') id: string) {
    return this.listingsService.syncToPlatform(id);
  }

  @Patch('bulk-prices')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  bulkUpdatePrices(@CurrentUser() user: JwtPayload, @Body() data: { projectId: string, increasePct: number }) {
    return this.listingsService.bulkUpdatePrices(user.tenantId, data.projectId, data.increasePct);
  }
}
