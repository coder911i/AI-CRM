import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TowersService } from './towers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('projects/:projectId/towers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TowersController {
  constructor(private readonly towersService: TowersService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string, @Body() createTowerDto: any) {
    return this.towersService.create(user, projectId, createTowerDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string) {
    return this.towersService.findAllByProject(user, projectId);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: any) {
    return this.towersService.update(user, id, data);
  }
}
