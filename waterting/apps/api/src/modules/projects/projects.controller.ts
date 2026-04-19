import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, Query, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Body() createProjectDto: any) {
    return this.projectsService.create(user, createProjectDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.projectsService.findAll(user, Number(page || 1), Number(limit || 50));
  }

  @Get(':id/units/export')
  async exportUnits(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Res() res: any) {
    const units = await this.prisma.unit.findMany({
      where: { tower: { projectId: id } },
      include: { tower: true },
      orderBy: [{ tower: { name: 'asc' } }, { floor: 'asc' }, { unitNumber: 'asc' }]
    });
    const header = 'Tower,Unit Number,Floor,Type,Area,Base Price,Status\n';
    const rows = units.map((u: any) => 
      `"${u.tower?.name}","${u.unitNumber}",${u.floor},"${u.type}",${u.carpetArea},${u.basePrice},"${u.status}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=project-units.csv`);
    res.send(header + rows);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.projectsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateProjectDto: any) {
    return this.projectsService.update(user, id, updateProjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.projectsService.remove(user, id);
  }
  @Get(':id/availability-matrix')
  async getAvailabilityMatrix(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        towers: {
          include: {
            units: {
              orderBy: [{ floor: 'desc' }, { unitNumber: 'asc' }]
            }
          }
        }
      }
    });
    if (!project) throw new NotFoundException('Project not found');

    const units = project.towers.flatMap(t => t.units);
    
    return {
      project: { name: project.name, location: project.location },
      summary: {
        total: units.length,
        available: units.filter(u => u.status === 'AVAILABLE').length,
        reserved: units.filter(u => u.status === 'RESERVED').length,
        booked: units.filter(u => u.status === 'BOOKED').length,
        sold: units.filter(u => u.status === 'SOLD').length,
      },
      towers: project.towers.map(t => ({
        id: t.id,
        name: t.name,
        units: t.units
      }))
    };
  }
}
