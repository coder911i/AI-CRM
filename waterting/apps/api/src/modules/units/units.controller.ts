import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole, UnitStatus } from '@waterting/shared';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post('towers/:towerId/units')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Param('towerId') towerId: string, @Body() createUnitDto: any) {
    return this.unitsService.create(user, towerId, createUnitDto);
  }

  @Get('towers/:towerId/units')
  findAll(@CurrentUser() user: JwtPayload, @Param('towerId') towerId: string) {
    return this.unitsService.findAllByTower(user, towerId);
  }

  @Patch('units/:id/status')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_AGENT)
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('status') status: UnitStatus,
    @Body('holdUntil') holdUntil?: string
  ) {
    return this.unitsService.updateStatus(user, id, status, holdUntil ? new Date(holdUntil) : undefined);
  }
}
