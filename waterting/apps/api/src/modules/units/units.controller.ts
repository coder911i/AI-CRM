import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole, UnitStatus } from '@waterting/shared';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  constructor(
    private readonly unitsService: UnitsService,
    private prisma: PrismaService,
  ) {}

  @Post('towers/:towerId/units')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Param('towerId') towerId: string, @Body() createUnitDto: any) {
    return this.unitsService.create(user, towerId, createUnitDto);
  }

  @Get('towers/:towerId/units')
  findAll(@CurrentUser() user: JwtPayload, @Param('towerId') towerId: string) {
    return this.unitsService.findAllByTower(user, towerId);
  }

  @Patch('units/bulk-price')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async bulkPrice(@Body() dto: { towerId: string; floor?: number; basePrice: number }) {
    return this.prisma.unit.updateMany({
      where: {
        towerId: dto.towerId,
        ...(dto.floor !== undefined && { floor: dto.floor }),
      },
      data: { basePrice: dto.basePrice, totalPrice: dto.basePrice },
    });
  }

  @Patch('units/:id/hold')
  async holdUnit(@Param('id') id: string, @Body() dto: { holdHours: 48 | 72 }) {
    const holdUntil = new Date(Date.now() + (dto.holdHours || 48) * 3600000);
    return this.prisma.unit.update({
      where: { id },
      data: { status: 'RESERVED', holdUntil },
    });
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
