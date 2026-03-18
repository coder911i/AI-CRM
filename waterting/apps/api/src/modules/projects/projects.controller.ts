import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

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
  findAll(@CurrentUser() user: JwtPayload) {
    return this.projectsService.findAll(user);
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
}
