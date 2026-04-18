import { Controller, Get, Post, Patch, Body, Param, UseGuards, Res } from '@nestjs/common';
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
  async bulkPrice(@CurrentUser() user: JwtPayload, @Body() dto: { towerId: string; floor?: number; basePrice: number }) {
    return this.prisma.unit.updateMany({
      where: {
        towerId: dto.towerId,
        tower: { project: { tenantId: user.tenantId } },
        ...(dto.floor !== undefined && { floor: dto.floor }),
      },
      data: { basePrice: dto.basePrice, totalPrice: dto.basePrice },
    });
  }

  @Patch('units/:id/hold')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_AGENT)
  async holdUnit(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: { leadId: string; durationHours: number }) {
    return this.unitsService.placeHold(user, id, dto);
  }

  @Patch('units/:id/release')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async releaseHold(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.unitsService.releaseHold(user, id);
  }

  @Patch('units/:id/extend-hold')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async extendHold(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('additionalHours') hours: number) {
    return this.unitsService.extendHold(user, id, hours);
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

  @Get('projects/:projectId/units/export')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async exportUnits(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string, @Res() res: any) {
    const units = await this.prisma.unit.findMany({
      where: { tower: { projectId, project: { tenantId: user.tenantId } } },
      include: { tower: true },
    });
    
    let csv = 'Unit Number,Tower,Floor,Type,Carpet Area,Total Price,Status\n';
    units.forEach(u => {
      csv += `${u.unitNumber},${u.tower.name},${u.floor},${u.type},${u.carpetArea},${u.totalPrice},${u.status}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inventory-export-${projectId}.csv`);
    res.send(csv);
  }
}
