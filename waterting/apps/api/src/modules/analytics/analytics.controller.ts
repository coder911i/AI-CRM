import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-report')
  getDashboardReport(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getDashboardReport(user);
  }

  @Get('inventory-insights')
  getInventoryInsights(@CurrentUser() user: JwtPayload, @Query('projectId') projectId?: string) {
    return this.analyticsService.getInventoryInsights(user.tenantId, projectId);
  }
}
