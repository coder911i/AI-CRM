import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, JwtPayload } from '@waterting/shared';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('inventory')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async getInventory(@CurrentUser() user: JwtPayload, @Query('projectId') projectId?: string) {
    return this.analytics.getInventoryInsights(user.tenantId, projectId);
  }
}
